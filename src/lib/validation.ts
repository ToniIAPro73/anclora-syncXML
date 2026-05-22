import type { GuestRecord, ParsedExcel, ValidationIssue, ValidationStatus } from "./domain";

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
