import type { GuestRecord, ParsedExcel, ValidationIssue, ValidationStatus } from "./domain";

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
  if (!guest.firstName) errors.push(issue("error", "guest.firstName.required", "Nombre obligatorio", "firstName", guest.sourceRow));
  if (!guest.surname1) errors.push(issue("error", "guest.surname1.required", "Primer apellido obligatorio", "surname1", guest.sourceRow));
  if (!guest.documentNumber) errors.push(issue("error", "guest.documentNumber.required", "Documento obligatorio", "documentNumber", guest.sourceRow));
  if (!guest.birthDate) errors.push(issue("error", "guest.birthDate.invalid", "Fecha de nacimiento invalida", "birthDate", guest.sourceRow));
  if (!guest.nationalityIso3) errors.push(issue("error", "guest.nationality.required", "Nacionalidad obligatoria", "nationalityIso3", guest.sourceRow));
  if (!guest.phone) warnings.push(issue("warning", "guest.phone.missing", "Telefono no informado", "phone", guest.sourceRow));
  if (!guest.email) warnings.push(issue("warning", "guest.email.missing", "Email no informado", "email", guest.sourceRow));
  if (!guest.relationship) warnings.push(issue("warning", "guest.relationship.missing", "Parentesco no informado", "relationship", guest.sourceRow));
  if (!guest.sex) warnings.push(issue("warning", "guest.sex.missing", "Sexo no informado", "sex", guest.sourceRow));
  if (!guest.documentSupport) warnings.push(issue("warning", "guest.documentSupport.missing", "Soporte de documento no informado", "documentSupport", guest.sourceRow));
  if (guest.countryIso3 === "ESP" && !guest.municipalityCode) warnings.push(issue("warning", "guest.municipalityCode.missing", "Codigo de municipio no informado", "municipalityCode", guest.sourceRow));
  return { ...guest, validationStatus: statusFrom(errors, warnings), errors, warnings };
}

export function validateParsedExcel(parsed: Omit<ParsedExcel, "validation">): ParsedExcel {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  if (!parsed.reservation.reference) errors.push(issue("error", "reservation.reference.required", "Referencia de reserva ausente", "reference"));
  if (!parsed.reservation.checkInDate || !parsed.reservation.checkOutDate) errors.push(issue("error", "reservation.dates.invalid", "Fechas de entrada/salida invalidas", "dates"));
  if (!parsed.property.establishmentCode) errors.push(issue("error", "property.establishmentCode.required", "Codigo de establecimiento ausente", "establishmentCode"));
  const validGuests = parsed.guests.filter((guest) => guest.errors.length === 0);
  if (parsed.reservation.guestCount && parsed.reservation.guestCount !== validGuests.length) {
    errors.push(issue("error", "reservation.guestCount.mismatch", "El numero de personas no coincide con los huespedes validos", "guestCount"));
  }
  const seen = new Map<string, number>();
  for (const guest of parsed.guests) {
    if (!guest.documentNumber) continue;
    const existing = seen.get(guest.documentNumber);
    if (existing) warnings.push(issue("warning", "guest.document.duplicate", `Documento duplicado entre filas ${existing} y ${guest.sourceRow}`, "documentNumber", guest.sourceRow));
    seen.set(guest.documentNumber, guest.sourceRow);
    errors.push(...guest.errors);
    warnings.push(...guest.warnings);
  }
  return { ...parsed, validation: { status: statusFrom(errors, warnings), errors, warnings } };
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

function findIbans(parsed: ParsedExcel) {
  const candidates: Array<{ value: string; row?: number }> = [];
  if (parsed.payment.iban) candidates.push({ value: parsed.payment.iban });
  for (const row of parsed.rawRows) {
    const joined = row.values.join(" ");
    const matches = joined.match(/\b[A-Z]{2}\d{2}[A-Z0-9 ]{10,34}\b/gi) ?? [];
    for (const match of matches) candidates.push({ value: match.replace(/\s+/g, ""), row: row.rowNumber });
  }
  return candidates.filter((candidate, index, all) => all.findIndex((item) => item.value === candidate.value && item.row === candidate.row) === index);
}

export function smartValidateParsedExcel(parsed: ParsedExcel): ParsedExcel {
  const guests = parsed.guests.map((guest) => {
    const errors = [...guest.errors];
    const warnings = [...guest.warnings];
    const document = normalizedDocument(guest.documentNumber);

    if (guest.documentType === "NIF" || guest.documentType === "NIE") {
      if (document && !hasValidSpanishDocumentControl(document)) {
        errors.push(issue("error", "guest.document.control.invalid", "DNI/NIE con letra de control invalida", "documentNumber", guest.sourceRow));
      }
    } else if (guest.documentType === "PAS" && document && !hasReasonablePassportFormat(document)) {
      warnings.push(issue("warning", "guest.passport.format.suspicious", "Pasaporte con formato poco probable", "documentNumber", guest.sourceRow));
    }

    if (guest.email && !isValidEmail(guest.email)) {
      errors.push(issue("error", "guest.email.invalid", "Email con formato invalido", "email", guest.sourceRow));
    }
    if (guest.phone) {
      const digits = normalizedDigits(guest.phone);
      if (digits.length < 7 || digits.length > 15) {
        warnings.push(issue("warning", "guest.phone.format.suspicious", "Telefono con longitud poco probable", "phone", guest.sourceRow));
      }
    }
    if (!isValidIso3(guest.nationalityIso3)) {
      errors.push(issue("error", "guest.nationality.iso.invalid", "Nacionalidad no normalizada como ISO3", "nationalityIso3", guest.sourceRow));
    }
    if (guest.countryIso3 === "ESP" && guest.postalCode && !isValidSpanishPostalCode(guest.postalCode)) {
      warnings.push(issue("warning", "guest.postalCode.invalid", "Codigo postal espanol no valido", "postalCode", guest.sourceRow));
    }
    if (guest.birthDate && isValidIsoDate(guest.birthDate)) {
      const age = getAge(guest.birthDate);
      if (age !== undefined && age < 0) errors.push(issue("error", "guest.birthDate.future", "Fecha de nacimiento futura", "birthDate", guest.sourceRow));
      else if (age !== undefined && age > 120) warnings.push(issue("warning", "guest.birthDate.unlikely", "Edad superior a 120 anos", "birthDate", guest.sourceRow));
    } else if (guest.birthDate) {
      errors.push(issue("error", "guest.birthDate.format.invalid", "Fecha de nacimiento con formato invalido", "birthDate", guest.sourceRow));
    }

    return { ...guest, errors, warnings, validationStatus: statusFrom(errors, warnings) };
  });

  const base = validateParsedExcel({ ...parsed, guests });
  const errors = [...base.validation.errors];
  const warnings = [...base.validation.warnings];

  if (base.reservation.checkInDate && base.reservation.checkOutDate && base.reservation.checkInDate >= base.reservation.checkOutDate) {
    errors.push(issue("error", "reservation.dates.order.invalid", "La fecha de salida debe ser posterior a la entrada", "dates"));
  }
  if (base.reservation.checkInTime && !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(base.reservation.checkInTime)) {
    errors.push(issue("error", "reservation.checkInTime.invalid", "Hora de entrada invalida", "checkInTime"));
  }
  if (base.reservation.checkOutTime && !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(base.reservation.checkOutTime)) {
    errors.push(issue("error", "reservation.checkOutTime.invalid", "Hora de salida invalida", "checkOutTime"));
  }
  if (base.property.countryIso3 && !isValidIso3(base.property.countryIso3)) {
    errors.push(issue("error", "property.country.iso.invalid", "Pais del establecimiento no normalizado como ISO3", "countryIso3"));
  }
  if (base.property.countryIso3 === "ESP" && base.property.postalCode && !isValidSpanishPostalCode(base.property.postalCode)) {
    errors.push(issue("error", "property.postalCode.invalid", "Codigo postal del establecimiento no valido", "postalCode"));
  }
  for (const candidate of findIbans(base)) {
    if (!isValidIban(candidate.value)) {
      pushIfMissing(errors, issue("error", "payment.iban.invalid", "IBAN con formato o checksum invalido", "iban", candidate.row));
    }
  }

  return { ...base, validation: { status: statusFrom(errors, warnings), errors, warnings } };
}

export function validateNoCriticalPlaceholders(xml: string): ValidationIssue[] {
  const checks: Array<[string, RegExp]> = [
    ["texto", />texto</],
    ["00000", /<(codigoMunicipio|codigoPostal)>00000<\/(codigoMunicipio|codigoPostal)>/],
    ["999999999", />999999999</],
    ["correo@correo.es", />correo@correo\.es</],
    ["2026-04-09 de ejemplo", /2026-04-09/],
  ];
  return checks
    .filter(([, pattern]) => pattern.test(xml))
    .map(([placeholder]) => issue("error", "xml.placeholder.critical", `Placeholder critico presente: ${placeholder}`));
}
