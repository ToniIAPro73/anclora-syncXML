import { XMLBuilder, XMLParser, XMLValidator } from "fast-xml-parser";
import type { GeneratedXmlResult, ParsedExcel } from "../domain";
import { toXmlDate, toXmlDateTime } from "../normalizers";
import { validateNoCriticalPlaceholders } from "../validation";

const TEMPLATE_XML = `<ns2:peticion xmlns:ns2="http://www.neg.hospedajes.mir.es/altaParteHospedaje"><solicitud><codigoEstablecimiento></codigoEstablecimiento><comunicacion><contrato><referencia></referencia><fechaContrato></fechaContrato><fechaEntrada></fechaEntrada><fechaSalida></fechaSalida><numPersonas>0</numPersonas><numHabitaciones>1</numHabitaciones><internet>true</internet><pago><tipoPago></tipoPago></pago></contrato></comunicacion></solicitud></ns2:peticion>`;

export function rejectDangerousXml(xml: string) {
  if (/<!ENTITY|<!DOCTYPE/i.test(xml)) throw new Error("XML peligroso no permitido");
}

const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: false, processEntities: false });
const builder = new XMLBuilder({ ignoreAttributes: false, format: true, suppressEmptyNode: false });

export function generateHospitalityXml(parsed: ParsedExcel, templateXml = TEMPLATE_XML): GeneratedXmlResult {
  rejectDangerousXml(templateXml);
  const validation = XMLValidator.validate(templateXml);
  if (validation !== true) throw new Error("XML plantilla mal formado");
  const validGuests = parsed.guests.filter((guest) => guest.errors.length === 0);
  const root = parser.parse(templateXml);
  const peticion = root["ns2:peticion"] ?? root.peticion;
  if (!peticion?.solicitud?.comunicacion) throw new Error("XML plantilla invalido");
  const comunicacion = peticion.solicitud.comunicacion;
  const contrato = comunicacion.contrato ?? {};
  comunicacion.persona = validGuests.map((guest) => ({
    rol: "VI",
    nombre: guest.firstName,
    apellido1: guest.surname1,
    ...(guest.surname2 ? { apellido2: guest.surname2 } : {}),
    tipoDocumento: guest.documentType ?? "OTRO",
    numeroDocumento: guest.documentNumber,
    ...(guest.documentSupport ? { soporteDocumento: guest.documentSupport } : {}),
    fechaNacimiento: toXmlDate(guest.birthDate),
    nacionalidad: guest.nationalityIso3,
    ...(guest.sex ? { sexo: guest.sex } : {}),
    direccion: {
      direccion: guest.address,
      ...(guest.addressComplement ? { direccionComplementaria: guest.addressComplement } : {}),
      ...(guest.countryIso3 === "ESP" && guest.municipalityCode ? { codigoMunicipio: guest.municipalityCode } : {}),
      ...(guest.countryIso3 !== "ESP" && guest.municipality ? { nombreMunicipio: guest.municipality } : {}),
      ...(guest.postalCode ? { codigoPostal: guest.postalCode } : {}),
      pais: guest.countryIso3 ?? guest.nationalityIso3 ?? "ESP",
    },
    ...(guest.phone ? { telefono: guest.phone } : {}),
    ...(guest.phone2 ? { telefono2: guest.phone2 } : {}),
    ...(guest.email ? { correo: guest.email } : {}),
    ...(guest.relationship ? { parentesco: guest.relationship } : {}),
  }));
  peticion.solicitud.codigoEstablecimiento = parsed.property.establishmentCode;
  comunicacion.contrato = {
    ...contrato,
    referencia: parsed.reservation.reference,
    fechaContrato: toXmlDate(parsed.reservation.contractDate),
    fechaEntrada: toXmlDateTime(parsed.reservation.checkInDate, parsed.reservation.checkInTime),
    fechaSalida: toXmlDateTime(parsed.reservation.checkOutDate, parsed.reservation.checkOutTime),
    numPersonas: validGuests.length,
    numHabitaciones: parsed.reservation.roomCount ?? 1,
    internet: parsed.reservation.internet ?? true,
    pago: {
      tipoPago: parsed.payment.paymentType ?? "OTRO",
      ...(parsed.payment.paymentMethod ? { medioPago: parsed.payment.paymentMethod } : {}),
      ...(parsed.payment.paymentHolder ? { titular: parsed.payment.paymentHolder } : {}),
    },
  };
  const xml = builder.build(root);
  const placeholderErrors = validateNoCriticalPlaceholders(xml);
  return {
    xml,
    visual: {
      reservation: parsed.reservation,
      property: parsed.property,
      payment: parsed.payment,
      guests: validGuests,
    },
    validation: {
      status: parsed.validation.errors.length || placeholderErrors.length ? "ERROR" : parsed.validation.warnings.length ? "WARNING" : "VALID",
      errors: [...parsed.validation.errors, ...placeholderErrors],
      warnings: parsed.validation.warnings,
    },
  };
}

export function assertWellFormedXml(xml: string) {
  rejectDangerousXml(xml);
  const validation = XMLValidator.validate(xml);
  if (validation !== true) throw new Error("XML mal formado");
  parser.parse(xml);
  return true;
}
