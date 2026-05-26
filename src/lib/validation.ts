import type { GuestRecord, ParsedExcel, ValidationIssue, ValidationStatus } from "./domain";
import { detectDuplicates } from "./duplicates";
import {
  HOSPEDAJES_DOCUMENT_TYPES,
  HOSPEDAJES_LIMITS,
  HOSPEDAJES_PAYMENT_TYPES,
  HOSPEDAJES_RELATIONSHIP_VALUES,
  HOSPEDAJES_SEX_VALUES,
  isAdultBirthDate,
  isMinorBirthDate,
  isSpanishCountry,
  requiresSpanishDocumentSupport,
} from "./ses/hospedajesRules";

const DNI_CONTROL = "TRWAGMYFPDXBNJZSQVHLCKE";
const IBAN_LENGTHS: Record<string, number> = {
  AD: 24,
  AE: 23,
  AL: 28,
  AT: 20,
  AZ: 28,
  BA: 20,
  BE: 16,
  BG: 22,
  BH: 22,
  BR: 29,
  CH: 21,
  CR: 22,
  CY: 28,
  CZ: 24,
  DE: 22,
  DK: 18,
  DO: 28,
  EE: 20,
  EG: 29,
  ES: 24,
  FI: 18,
  FO: 18,
  FR: 27,
  GB: 22,
  GE: 22,
  GI: 23,
  GL: 18,
  GR: 27,
  GT: 28,
  HR: 21,
  HU: 28,
  IE: 22,
  IL: 23,
  IS: 26,
  IT: 27,
  JO: 30,
  KW: 30,
  KZ: 20,
  LB: 28,
  LC: 32,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  MC: 27,
  MD: 24,
  ME: 22,
  MK: 19,
  MR: 27,
  MT: 31,
  MU: 30,
  NL: 18,
  NO: 15,
  PK: 24,
  PL: 28,
  PS: 29,
  PT: 25,
  QA: 29,
  RO: 24,
  RS: 22,
  SA: 24,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  TN: 24,
  TR: 26,
  UA: 29,
  VA: 22,
  VG: 24,
  XK: 20,
};
function issue(severity: "error" | "warning", code: string, message: string, field?: string, sourceRow?: number): ValidationIssue {
  return { severity, code, message, field, sourceRow };
}

function statusFrom(errors: ValidationIssue[], warnings: ValidationIssue[]): ValidationStatus {
  if (errors.length) return "ERROR";
  if (warnings.length) return "WARNING";
  return "VALID";
}

export function validateGuest(guest: Omit<GuestRecord, "validationStatus" | "errors" | "warnings">): GuestRecord {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const adult = isAdultBirthDate(guest.birthDate);
  const minor = isMinorBirthDate(guest.birthDate);
  const countryIso3 = guest.countryIso3 ?? guest.nationalityIso3;
  if (!guest.firstName) errors.push(issue("error", "guest.firstName.required", "Nombre obligatorio", "firstName", guest.sourceRow));
  else if (guest.firstName.length > HOSPEDAJES_LIMITS.firstName) errors.push(issue("error", "guest.firstName.maxLength", "Nombre superior a 50 caracteres", "firstName", guest.sourceRow));
  if (!guest.surname1) errors.push(issue("error", "guest.surname1.required", "Primer apellido obligatorio", "surname1", guest.sourceRow));
  else if (guest.surname1.length > HOSPEDAJES_LIMITS.surname) errors.push(issue("error", "guest.surname1.maxLength", "Primer apellido superior a 50 caracteres", "surname1", guest.sourceRow));
  if (guest.surname2 && guest.surname2.length > HOSPEDAJES_LIMITS.surname) errors.push(issue("error", "guest.surname2.maxLength", "Segundo apellido superior a 50 caracteres", "surname2", guest.sourceRow));
  if (guest.documentType === "NIF" && !guest.surname2) errors.push(issue("error", "guest.surname2.requiredForNif", "Segundo apellido obligatorio cuando el documento es NIF", "surname2", guest.sourceRow));
  if (adult && !guest.documentNumber) errors.push(issue("error", "guest.documentNumber.required", "Documento obligatorio para personas mayores de edad", "documentNumber", guest.sourceRow));
  else if (guest.documentNumber && normalizedDocument(guest.documentNumber).length > HOSPEDAJES_LIMITS.documentNumber) errors.push(issue("error", "guest.documentNumber.maxLength", "Documento superior a 15 caracteres", "documentNumber", guest.sourceRow));
  if (adult && !guest.documentType) errors.push(issue("error", "guest.documentType.required", "Tipo de documento obligatorio para personas mayores de edad", "documentType", guest.sourceRow));
  else if (guest.documentType && !HOSPEDAJES_DOCUMENT_TYPES.has(guest.documentType)) errors.push(issue("error", "guest.documentType.invalid", "Tipo de documento no admitido", "documentType", guest.sourceRow));
  if (!guest.birthDate) errors.push(issue("error", "guest.birthDate.invalid", "Fecha de nacimiento inválida", "birthDate", guest.sourceRow));
  if (!guest.nationalityIso3) errors.push(issue("error", "guest.nationality.required", "Nacionalidad obligatoria", "nationalityIso3", guest.sourceRow));
  if (guest.sex && !HOSPEDAJES_SEX_VALUES.has(guest.sex)) errors.push(issue("error", "guest.sex.invalid", "Sexo no admitido", "sex", guest.sourceRow));
  if (!guest.address) errors.push(issue("error", "guest.address.required", "Dirección de residencia obligatoria", "address", guest.sourceRow));
  else if (guest.address.length > HOSPEDAJES_LIMITS.address) errors.push(issue("error", "guest.address.maxLength", "Dirección superior a 100 caracteres", "address", guest.sourceRow));
  if (guest.addressComplement && guest.addressComplement.length > HOSPEDAJES_LIMITS.addressComplement) errors.push(issue("error", "guest.addressComplement.maxLength", "Dirección complementaria superior a 100 caracteres", "addressComplement", guest.sourceRow));
  if (!guest.postalCode) errors.push(issue("error", "guest.postalCode.required", "Código postal obligatorio para generar el XML SES", "postalCode", guest.sourceRow));
  else if (guest.postalCode.length > HOSPEDAJES_LIMITS.postalCode) errors.push(issue("error", "guest.postalCode.maxLength", "Código postal superior a 20 caracteres", "postalCode", guest.sourceRow));
  if (!countryIso3) errors.push(issue("error", "guest.country.required", "País de residencia obligatorio", "countryIso3", guest.sourceRow));
  if (isSpanishCountry(countryIso3)) {
    if (!guest.municipalityCode) errors.push(issue("error", "guest.municipalityCode.required", "Código de municipio INE obligatorio para residentes en España", "municipalityCode", guest.sourceRow));
  } else if (!guest.municipality) {
    errors.push(issue("error", "guest.municipality.required", "Municipio o ciudad obligatorio para residentes fuera de España", "municipality", guest.sourceRow));
  } else if (guest.municipality.length > HOSPEDAJES_LIMITS.municipalityName) {
    errors.push(issue("error", "guest.municipality.maxLength", "Municipio o ciudad superior a 100 caracteres", "municipality", guest.sourceRow));
  }
  if (requiresSpanishDocumentSupport(guest.documentType) && !guest.documentSupport) errors.push(issue("error", "guest.documentSupport.required", "Soporte de documento obligatorio para NIF/NIE", "documentSupport", guest.sourceRow));
  if (guest.documentSupport && guest.documentSupport.length > HOSPEDAJES_LIMITS.documentSupport) errors.push(issue("error", "guest.documentSupport.maxLength", "Soporte de documento superior a 9 caracteres", "documentSupport", guest.sourceRow));
  if (guest.relationship && guest.relationship.length > HOSPEDAJES_LIMITS.relationship) errors.push(issue("error", "guest.relationship.maxLength", "Parentesco superior a 2 caracteres", "relationship", guest.sourceRow));
  if (guest.relationship && !HOSPEDAJES_RELATIONSHIP_VALUES.has(guest.relationship.toUpperCase())) errors.push(issue("error", "guest.relationship.invalid", "Parentesco no admitido por el catálogo SES", "relationship", guest.sourceRow));
  if (minor && !guest.relationship) errors.push(issue("error", "guest.relationship.requiredForMinor", "Parentesco obligatorio cuando la persona es menor de edad", "relationship", guest.sourceRow));
  if (!guest.phone && !guest.phone2 && !guest.email) errors.push(issue("error", "guest.contact.required", "Debe informarse al menos un teléfono o email de contacto", "phone", guest.sourceRow));
  if (guest.phone && guest.phone.length > HOSPEDAJES_LIMITS.phone) errors.push(issue("error", "guest.phone.maxLength", "Teléfono superior a 20 caracteres", "phone", guest.sourceRow));
  if (guest.phone2 && guest.phone2.length > HOSPEDAJES_LIMITS.phone) errors.push(issue("error", "guest.phone2.maxLength", "Segundo teléfono superior a 20 caracteres", "phone2", guest.sourceRow));
  if (guest.email && guest.email.length > HOSPEDAJES_LIMITS.email) errors.push(issue("error", "guest.email.maxLength", "Email superior a 250 caracteres", "email", guest.sourceRow));
  return { ...guest, validationStatus: statusFrom(errors, warnings), errors, warnings };
}

export function validateParsedExcel(parsed: Omit<ParsedExcel, "validation">): ParsedExcel {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  if (!parsed.reservation.reference) errors.push(issue("error", "reservation.reference.required", "Referencia de reserva ausente", "reference"));
  else if (parsed.reservation.reference.length > 50) errors.push(issue("error", "reservation.reference.maxLength", "Referencia superior a 50 caracteres", "reference"));
  if (!parsed.reservation.checkInDate || !parsed.reservation.checkOutDate) errors.push(issue("error", "reservation.dates.invalid", "Fechas de entrada/salida inválidas", "dates"));
  if (!parsed.property.establishmentCode) errors.push(issue("error", "property.establishmentCode.required", "Código de establecimiento ausente", "establishmentCode"));
  else if (parsed.property.establishmentCode.length > 10) errors.push(issue("error", "property.establishmentCode.maxLength", "Código de establecimiento superior a 10 caracteres", "establishmentCode"));
  if (parsed.reservation.guestCount && parsed.reservation.guestCount !== parsed.guests.length) {
    errors.push(issue("error", "reservation.guestCount.mismatch", "El número de personas no coincide con los huéspedes válidos", "guestCount"));
  }
  if (parsed.payment.paymentType && !HOSPEDAJES_PAYMENT_TYPES.has(parsed.payment.paymentType)) {
    errors.push(issue("error", "payment.type.invalid", "Tipo de pago no permitido", "paymentType"));
  }
  const seen = new Map<string, number>();
  for (const guest of parsed.guests) {
    errors.push(...guest.errors);
    warnings.push(...guest.warnings);
    if (!guest.documentNumber) continue;
    const existing = seen.get(guest.documentNumber);
    if (existing) warnings.push(issue("warning", "guest.document.duplicate", `Documento duplicado entre filas ${existing} y ${guest.sourceRow}`, "documentNumber", guest.sourceRow));
    seen.set(guest.documentNumber, guest.sourceRow);
  }
  const withValidation = { ...parsed, validation: { status: statusFrom(errors, warnings), errors, warnings } };
  return { ...withValidation, duplicates: parsed.duplicates ?? detectDuplicates(withValidation) };
}

function normalizedDocument(value?: string) {
  return (value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function hasValidSpanishDocumentControl(value: string) {
  const document = normalizedDocument(value);
  const nif = document.match(/^(\d{8})([A-Z])$/);
  if (nif) return DNI_CONTROL[Number.parseInt(nif[1], 10) % 23] === nif[2];
  const nie = document.match(/^([XYZ])(\d{7})([A-Z])$/);
  if (!nie) return false;
  const prefix = { X: "0", Y: "1", Z: "2" }[nie[1] as "X" | "Y" | "Z"];
  return DNI_CONTROL[Number.parseInt(`${prefix}${nie[2]}`, 10) % 23] === nie[3];
}

function hasReasonablePassportFormat(value: string) {
  const document = normalizedDocument(value);
  return /^[A-Z0-9]{5,15}$/.test(document) && /[0-9]/.test(document);
}

function isValidIban(value: string) {
  const iban = value.toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) return false;
  const expectedLength = IBAN_LENGTHS[iban.slice(0, 2)];
  if (!expectedLength || iban.length !== expectedLength) return false;
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let remainder = 0;
  for (const character of rearranged) {
    const numeric = /[A-Z]/.test(character) ? String(character.charCodeAt(0) - 55) : character;
    for (const digit of numeric) remainder = (remainder * 10 + Number.parseInt(digit, 10)) % 97;
  }
  return remainder === 1;
}

function getAge(date: string) {
  const birth = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const hadBirthday = today.getUTCMonth() > birth.getUTCMonth()
    || (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() >= birth.getUTCDate());
  if (!hadBirthday) age -= 1;
  return age;
}

function isValidIsoDate(value?: string) {
  if (!value) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function normalizedDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidSpanishPostalCode(value?: string) {
  if (!value || !/^\d{5}$/.test(value)) return false;
  const province = Number.parseInt(value.slice(0, 2), 10);
  return province >= 1 && province <= 52;
}

function isValidIso3(value?: string) {
  return Boolean(value && /^[A-Z]{3}$/.test(value));
}

function pushIfMissing(issues: ValidationIssue[], next: ValidationIssue) {
  if (!issues.some((item) => item.code === next.code && item.field === next.field && item.sourceRow === next.sourceRow)) issues.push(next);
}

function toValidationInput(guest: GuestRecord): Omit<GuestRecord, "validationStatus" | "errors" | "warnings"> {
  return {
    sourceRow: guest.sourceRow,
    role: guest.role,
    firstName: guest.firstName,
    surname1: guest.surname1,
    surname2: guest.surname2,
    birthDate: guest.birthDate,
    nationalityIso3: guest.nationalityIso3,
    documentType: guest.documentType,
    documentNumber: guest.documentNumber,
    documentSupport: guest.documentSupport,
    sex: guest.sex,
    address: guest.address,
    addressComplement: guest.addressComplement,
    municipality: guest.municipality,
    municipalityCode: guest.municipalityCode,
    postalCode: guest.postalCode,
    countryIso3: guest.countryIso3,
    phone: guest.phone,
    phone2: guest.phone2,
    email: guest.email,
    relationship: guest.relationship,
    arrivalDate: guest.arrivalDate,
    departureDate: guest.departureDate,
  };
}

function findIbans(parsed: ParsedExcel) {
  const candidates: Array<{ value: string; row?: number }> = [];
  if (parsed.payment.iban) candidates.push({ value: parsed.payment.iban });
  for (const row of parsed.rawRows) {
    const joined = row.values.join(" ");
    const matches = joined.match(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]){10,30}\b/g) ?? [];
    for (const match of matches) candidates.push({ value: match.replace(/\s+/g, ""), row: row.rowNumber });
  }
  return candidates.filter((candidate, index, all) => all.findIndex((item) => item.value === candidate.value && item.row === candidate.row) === index);
}

export function smartValidateParsedExcel(parsed: ParsedExcel): ParsedExcel {
  const guests = parsed.guests.map((guest) => {
    const baseGuest = validateGuest(toValidationInput(guest));
    const errors = [...baseGuest.errors];
    const warnings = [...baseGuest.warnings];
    const document = normalizedDocument(guest.documentNumber);

    if (guest.documentType === "NIF" || guest.documentType === "NIE") {
      if (document && !hasValidSpanishDocumentControl(document)) {
        errors.push(issue("error", "guest.document.control.invalid", "DNI/NIE con letra de control invalida", "documentNumber", guest.sourceRow));
      }
    } else if (guest.documentType === "PAS" && document && !hasReasonablePassportFormat(document)) {
      warnings.push(issue("warning", "guest.passport.format.suspicious", "Pasaporte con formato poco probable", "documentNumber", guest.sourceRow));
    }

    if (guest.email && !isValidEmail(guest.email)) {
      errors.push(issue("error", "guest.email.invalid", "Email con formato inválido", "email", guest.sourceRow));
    }
    if (guest.phone) {
      const digits = normalizedDigits(guest.phone);
      if (digits.length < 7 || digits.length > 15) {
        warnings.push(issue("warning", "guest.phone.format.suspicious", "Teléfono con longitud poco probable", "phone", guest.sourceRow));
      }
    }
    if (!isValidIso3(guest.nationalityIso3)) {
      errors.push(issue("error", "guest.nationality.iso.invalid", "Nacionalidad no normalizada como ISO3", "nationalityIso3", guest.sourceRow));
    }
    if (guest.countryIso3 === "ESP" && guest.postalCode && !isValidSpanishPostalCode(guest.postalCode)) {
      errors.push(issue("error", "guest.postalCode.invalid", "Código postal español no válido", "postalCode", guest.sourceRow));
    }
    if (guest.birthDate && isValidIsoDate(guest.birthDate)) {
      const age = getAge(guest.birthDate);
      if (age !== undefined && age < 0) errors.push(issue("error", "guest.birthDate.future", "Fecha de nacimiento futura", "birthDate", guest.sourceRow));
      else if (age !== undefined && age > 120) warnings.push(issue("warning", "guest.birthDate.unlikely", "Edad superior a 120 años", "birthDate", guest.sourceRow));
    } else if (guest.birthDate) {
      errors.push(issue("error", "guest.birthDate.format.invalid", "Fecha de nacimiento con formato inválido", "birthDate", guest.sourceRow));
    }

    return { ...baseGuest, errors, warnings, validationStatus: statusFrom(errors, warnings) };
  });

  const base = validateParsedExcel({ ...parsed, guests });
  const errors = [...base.validation.errors];
  const warnings = [...base.validation.warnings];

  if (base.reservation.checkInDate && base.reservation.checkOutDate && base.reservation.checkInDate >= base.reservation.checkOutDate) {
    errors.push(issue("error", "reservation.dates.order.invalid", "La fecha de salida debe ser posterior a la entrada", "dates"));
  }
  if (base.reservation.checkInDate) {
    const checkIn = new Date(`${base.reservation.checkInDate}T00:00:00Z`).getTime();
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    if (!Number.isNaN(checkIn) && checkIn < oneYearAgo) {
      errors.push(issue("error", "reservation.checkInDate.tooOld", "La fecha de entrada no puede ser anterior a un año (límite SES)", "checkInDate"));
    }
  }
  if (base.reservation.checkInTime && !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(base.reservation.checkInTime)) {
    errors.push(issue("error", "reservation.checkInTime.invalid", "Hora de entrada invalida", "checkInTime"));
  }
  if (base.reservation.checkOutTime && !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(base.reservation.checkOutTime)) {
    errors.push(issue("error", "reservation.checkOutTime.invalid", "Hora de salida invalida", "checkOutTime"));
  }
  if (base.property.countryIso3 && !isValidIso3(base.property.countryIso3)) {
    errors.push(issue("error", "property.country.iso.invalid", "País del establecimiento no normalizado como ISO3", "countryIso3"));
  }
  if (base.property.countryIso3 === "ESP" && base.property.postalCode && !isValidSpanishPostalCode(base.property.postalCode)) {
    errors.push(issue("error", "property.postalCode.invalid", "Código postal del establecimiento no válido", "postalCode"));
  }
  for (const candidate of findIbans(base)) {
    if (!isValidIban(candidate.value)) {
      pushIfMissing(errors, issue("error", "payment.iban.invalid", "IBAN con formato o checksum inválido", "iban", candidate.row));
    }
  }

  const withValidation = { ...base, validation: { status: statusFrom(errors, warnings), errors, warnings } };
  return { ...withValidation, duplicates: detectDuplicates(withValidation) };
}

export function validateForBackendConsolidation(parsed: ParsedExcel): ParsedExcel["validation"] {
  const validated = smartValidateParsedExcel(parsed);
  return validated.validation;
}

export function validateNoCriticalPlaceholders(xml: string): ValidationIssue[] {
  const checks: Array<[string, RegExp]> = [
    ["texto", />texto</],
    ["00000", /<(codigoMunicipio|codigoPostal)>00000<\/(codigoMunicipio|codigoPostal)>/],
    ["999999999", />999999999</],
    ["correo@correo.es", />correo@correo\.es</],
    ["fecha/hora de ejemplo", /2026-04-09T11:26:27\.782/],
  ];
  return checks
    .filter(([, pattern]) => pattern.test(xml))
    .map(([placeholder]) => issue("error", "xml.placeholder.critical", `Placeholder crítico presente: ${placeholder}`));
}
