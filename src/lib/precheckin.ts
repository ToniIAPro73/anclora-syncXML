import { randomBytes, createHash } from "node:crypto";
import type { GuestRecord, ParsedExcel, ValidationIssue } from "./domain";

export type PrecheckinStatus = "DRAFT" | "SUBMITTED_FOR_REVIEW" | "EXPIRED";

export type PrecheckinGuestDraft = Pick<GuestRecord, "sourceRow" | "firstName" | "surname1" | "surname2">;

export type PrecheckinGuestSubmission = {
  sourceRow: number;
  firstName: string;
  surname1: string;
  surname2?: string;
  documentType?: string;
  documentNumber?: string;
  documentSupport?: string;
  birthDate?: string;
  nationalityIso3?: string;
  sex?: string;
  address?: string;
  municipality?: string;
  municipalityCode?: string;
  postalCode?: string;
  countryIso3?: string;
  phone?: string;
  email?: string;
  relationship?: string;
};

export type PrecheckinSession = {
  token: string;
  reservationReference?: string;
  propertyName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount: number;
  guests: PrecheckinGuestDraft[];
  status: PrecheckinStatus;
  createdAt: string;
  expiresAt: string;
  submittedAt?: string;
  submissionHash?: string;
  metadataPolicy: {
    productRole: "SES_AUTHORITATIVE_METADATA_ONLY";
    storesDocumentImages: false;
    storesLegalRegistry: false;
    purpose: string;
    retentionScope: string[];
  };
};

export type PublicPrecheckinSession = Omit<PrecheckinSession, "submissionHash">;

export type PrecheckinSubmissionResult = {
  status: PrecheckinStatus;
  issues: ValidationIssue[];
  submissionHash?: string;
};

const store = globalThis as unknown as { syncXmlPrecheckinSessions?: PrecheckinSession[] };
store.syncXmlPrecheckinSessions ??= [];

export function createPrecheckinTestSession(parsed: ParsedExcel, now = new Date()) {
  const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
  const session: PrecheckinSession = {
    token: randomBytes(24).toString("base64url"),
    reservationReference: parsed.reservation.reference,
    propertyName: parsed.property.name,
    checkInDate: parsed.reservation.checkInDate,
    checkOutDate: parsed.reservation.checkOutDate,
    guestCount: parsed.guests.length,
    guests: parsed.guests.map((guest) => ({
      sourceRow: guest.sourceRow,
      firstName: guest.firstName,
      surname1: guest.surname1,
      surname2: guest.surname2,
    })),
    status: "DRAFT",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    metadataPolicy: {
      productRole: "SES_AUTHORITATIVE_METADATA_ONLY",
      storesDocumentImages: false,
      storesLegalRegistry: false,
      purpose: "Prueba de pre-check-in para completar datos antes de revision y comunicacion SES.",
      retentionScope: [
        "token temporal",
        "referencia de reserva",
        "estado operativo",
        "hash de envio",
        "timestamps de creacion, expiracion y envio",
      ],
    },
  };
  store.syncXmlPrecheckinSessions?.push(session);
  return session;
}

export function getPrecheckinSession(token: string, now = new Date()) {
  const session = store.syncXmlPrecheckinSessions?.find((item) => item.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < now.getTime()) {
    session.status = "EXPIRED";
  }
  return session;
}

export function toPublicPrecheckinSession(session: PrecheckinSession): PublicPrecheckinSession {
  const publicSession = { ...session };
  delete publicSession.submissionHash;
  return publicSession;
}

export function submitPrecheckinTestData(token: string, input: unknown, now = new Date()): PrecheckinSubmissionResult | null {
  const session = getPrecheckinSession(token, now);
  if (!session) return null;
  const issues = validatePrecheckinSubmission(input, session.guestCount);
  if (issues.length) return { status: session.status, issues };

  session.status = "SUBMITTED_FOR_REVIEW";
  session.submittedAt = now.toISOString();
  session.submissionHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");

  return { status: session.status, issues: [], submissionHash: session.submissionHash };
}

export function validatePrecheckinSubmission(input: unknown, expectedGuests: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!input || typeof input !== "object") {
    return [issue("error", "precheckin.payload.invalid", "Payload de pre-check-in invalido")];
  }

  const data = input as { privacyAccepted?: unknown; guests?: unknown; documentImage?: unknown; documentImages?: unknown };
  if ("documentImage" in data || "documentImages" in data) {
    issues.push(issue("error", "precheckin.documentImage.blocked", "No se permite almacenar imagenes de DNI o pasaporte", "documentImage"));
  }
  if (data.privacyAccepted !== true) {
    issues.push(issue("error", "precheckin.privacy.required", "El aviso de privacidad debe aceptarse antes de enviar", "privacyAccepted"));
  }
  if (!Array.isArray(data.guests)) {
    issues.push(issue("error", "precheckin.guests.required", "Debe enviarse al menos un viajero", "guests"));
    return issues;
  }
  if (data.guests.length !== expectedGuests) {
    issues.push(issue("error", "precheckin.guests.count", "El numero de viajeros no coincide con la reserva", "guests"));
  }

  data.guests.forEach((rawGuest, index) => {
    const guest = rawGuest && typeof rawGuest === "object" ? rawGuest as Partial<PrecheckinGuestSubmission> : {};
    const prefix = `guests.${index}`;
    required(issues, guest.firstName, `${prefix}.firstName`, "Nombre obligatorio");
    required(issues, guest.surname1, `${prefix}.surname1`, "Primer apellido obligatorio");
    required(issues, guest.documentType, `${prefix}.documentType`, "Tipo de documento obligatorio");
    required(issues, guest.documentNumber, `${prefix}.documentNumber`, "Numero de documento obligatorio");
    required(issues, guest.birthDate, `${prefix}.birthDate`, "Fecha de nacimiento obligatoria");
    required(issues, guest.nationalityIso3, `${prefix}.nationalityIso3`, "Nacionalidad obligatoria");
    required(issues, guest.sex, `${prefix}.sex`, "Sexo obligatorio");
    required(issues, guest.address, `${prefix}.address`, "Direccion obligatoria");
    required(issues, guest.postalCode, `${prefix}.postalCode`, "Codigo postal obligatorio");
    required(issues, guest.countryIso3, `${prefix}.countryIso3`, "Pais obligatorio");
    required(issues, guest.relationship, `${prefix}.relationship`, "Parentesco obligatorio");

    if (!guest.phone && !guest.email) {
      issues.push(issue("error", "precheckin.contact.required", "Debe informarse telefono o email", `${prefix}.contact`));
    }
    if ((guest.documentType === "NIF" || guest.documentType === "NIE") && !guest.documentSupport) {
      issues.push(issue("error", "precheckin.documentSupport.required", "El soporte del documento es obligatorio para NIF/NIE", `${prefix}.documentSupport`));
    }
    if ((guest.countryIso3 ?? "ESP") === "ESP" && !guest.municipalityCode) {
      issues.push(issue("error", "precheckin.municipalityCode.required", "El codigo INE de municipio es obligatorio para direcciones en Espana", `${prefix}.municipalityCode`));
    }
    if (guest.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      issues.push(issue("error", "precheckin.email.invalid", "Email no valido", `${prefix}.email`));
    }
  });

  return issues;
}

function required(issues: ValidationIssue[], value: unknown, field: string, message: string) {
  if (typeof value !== "string" || !value.trim()) issues.push(issue("error", "precheckin.required", message, field));
}

function issue(severity: ValidationIssue["severity"], code: string, message: string, field?: string): ValidationIssue {
  return { severity, code, message, field };
}
