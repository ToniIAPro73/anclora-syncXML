import { randomUUID } from "node:crypto";
import type { GeneratedXmlResult, ParsedExcel } from "../domain";
import { hasDatabase, prisma } from "./prisma";

type StoredReservation = {
  id: string;
  reference?: string;
  status: string;
  validationStatus: string;
  createdAt: string;
  generatedAt?: string;
  deletedAt?: string;
  payload: ParsedExcel;
  xml: string;
};

const memoryStore = globalThis as unknown as { syncXmlReservations?: StoredReservation[] };
memoryStore.syncXmlReservations ??= [];

export async function createReservation(input: {
  parsed: ParsedExcel;
  generated: GeneratedXmlResult;
  sourceExcel?: { name: string; type: string; buffer: Buffer };
}) {
  if (!hasDatabase()) {
    const item: StoredReservation = {
      id: randomUUID(),
      reference: input.parsed.reservation.reference,
      status: "CONSOLIDATED",
      validationStatus: input.generated.validation.status,
      createdAt: new Date().toISOString(),
      generatedAt: new Date().toISOString(),
      payload: input.parsed,
      xml: input.generated.xml,
    };
    memoryStore.syncXmlReservations?.push(item);
    return item;
  }

  return prisma.$transaction(async (tx) => {
    const property = await tx.property.create({
      data: {
        name: input.parsed.property.name ?? "Sin nombre",
        establishmentCode: input.parsed.property.establishmentCode,
        address: input.parsed.property.address,
        municipality: input.parsed.property.municipality,
        municipalityCode: input.parsed.property.municipalityCode,
        postalCode: input.parsed.property.postalCode,
        province: input.parsed.property.province,
        countryIso3: input.parsed.property.countryIso3 ?? "ESP",
      },
    });
    const reservation = await tx.reservation.create({
      data: {
        propertyId: property.id,
        reference: input.parsed.reservation.reference,
        checkIn: input.parsed.reservation.checkInDate ? new Date(input.parsed.reservation.checkInDate) : undefined,
        checkOut: input.parsed.reservation.checkOutDate ? new Date(input.parsed.reservation.checkOutDate) : undefined,
        contractDate: input.parsed.reservation.contractDate ? new Date(input.parsed.reservation.contractDate) : undefined,
        guestCount: input.generated.visual.guests.length,
        roomCount: input.parsed.reservation.roomCount,
        internet: input.parsed.reservation.internet,
        paymentType: input.parsed.payment.paymentType,
        status: "CONSOLIDATED",
        validationStatus: input.generated.validation.status,
        validationReportJson: input.generated.validation,
        normalizedPayloadJson: input.parsed,
        generatedAt: new Date(),
        guests: {
          create: input.parsed.guests.map((guest) => ({
            sourceRow: guest.sourceRow,
            role: guest.role,
            firstName: guest.firstName,
            surname1: guest.surname1,
            surname2: guest.surname2,
            birthDate: guest.birthDate ? new Date(guest.birthDate) : undefined,
            nationalityIso3: guest.nationalityIso3,
            documentType: guest.documentType,
            documentNumber: guest.documentNumber,
            documentSupport: guest.documentSupport,
            sex: guest.sex,
            address: guest.address,
            municipality: guest.municipality,
            municipalityCode: guest.municipalityCode,
            postalCode: guest.postalCode,
            countryIso3: guest.countryIso3,
            phone: guest.phone,
            phone2: guest.phone2,
            email: guest.email,
            relationship: guest.relationship,
            validationStatus: guest.validationStatus,
            validationErrors: guest.errors,
            validationWarnings: guest.warnings,
          })),
        },
        auditEvents: {
          create: [
            { eventType: "RESERVATION_CONSOLIDATED", message: "Reserva consolidada" },
            { eventType: "XML_GENERATED", message: "XML generado por reserva" },
          ],
        },
      },
      include: { property: true, guests: true, files: true, auditEvents: true },
    });
    return reservation;
  });
}

export async function listReservations(query?: string) {
  if (!hasDatabase()) {
    const q = query?.toLowerCase();
    return (memoryStore.syncXmlReservations ?? []).filter((item) => !item.deletedAt && (!q || JSON.stringify(item).toLowerCase().includes(q)));
  }
  return prisma.reservation.findMany({
    where: {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { reference: { contains: query, mode: "insensitive" } },
              { property: { name: { contains: query, mode: "insensitive" } } },
              { guests: { some: { firstName: { contains: query, mode: "insensitive" } } } },
              { guests: { some: { surname1: { contains: query, mode: "insensitive" } } } },
              { guests: { some: { documentNumber: { contains: query, mode: "insensitive" } } } },
              { guests: { some: { email: { contains: query, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { property: true, guests: true },
    take: 100,
  });
}

export async function getReservation(id: string) {
  if (!hasDatabase()) return (memoryStore.syncXmlReservations ?? []).find((item) => item.id === id && !item.deletedAt);
  return prisma.reservation.findFirst({ where: { id, deletedAt: null }, include: { property: true, guests: true, files: true, auditEvents: true } });
}

export async function deleteReservation(id: string) {
  if (!hasDatabase()) {
    const item = (memoryStore.syncXmlReservations ?? []).find((reservation) => reservation.id === id);
    if (item) item.deletedAt = new Date().toISOString();
    return item;
  }
  return prisma.reservation.update({
    where: { id },
    data: {
      status: "DELETED",
      deletedAt: new Date(),
      files: { updateMany: { where: { deletedAt: null }, data: { deletedAt: new Date() } } },
      auditEvents: { create: { eventType: "RESERVATION_DELETED", message: "Reserva eliminada desde dashboard" } },
    },
  });
}
