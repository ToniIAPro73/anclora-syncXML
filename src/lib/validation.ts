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
function issue(severity: "error" | "warning", code: string, message: string, field?: string, sourceRow?: number, recommendation?: string): ValidationIssue {
  return { severity, code, message, recommendation, field, sourceRow };
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
  if (!guest.firstName) errors.push(issue("error", "guest.firstName.required", "Falta el nombre del huésped", "firstName", guest.sourceRow, "Introduce el nombre de pila del huésped"));
  else if (guest.firstName.length > HOSPEDAJES_LIMITS.firstName) errors.push(issue("error", "guest.firstName.maxLength", "El nombre es demasiado largo (máximo 50 caracteres)", "firstName", guest.sourceRow, "Abrevia el nombre si es necesario para que no supere 50 caracteres"));
  if (!guest.surname1) errors.push(issue("error", "guest.surname1.required", "Falta el primer apellido del huésped", "surname1", guest.sourceRow, "Introduce el primer apellido del huésped"));
  else if (guest.surname1.length > HOSPEDAJES_LIMITS.surname) errors.push(issue("error", "guest.surname1.maxLength", "El primer apellido es demasiado largo (máximo 50 caracteres)", "surname1", guest.sourceRow, "Abrevia el apellido para que no supere 50 caracteres"));
  if (guest.surname2 && guest.surname2.length > HOSPEDAJES_LIMITS.surname) errors.push(issue("error", "guest.surname2.maxLength", "El segundo apellido es demasiado largo (máximo 50 caracteres)", "surname2", guest.sourceRow, "Abrevia el apellido para que no supere 50 caracteres"));
  if (guest.documentType === "NIF" && !guest.surname2) errors.push(issue("error", "guest.surname2.requiredForNif", "Con documento NIF, el segundo apellido es obligatorio", "surname2", guest.sourceRow, "Añade el segundo apellido del huésped en la columna correspondiente"));
  if (adult && !guest.documentNumber) errors.push(issue("error", "guest.documentNumber.required", "Falta el número de documento (obligatorio para mayores de 18 años)", "documentNumber", guest.sourceRow, "Introduce el número de NIF, NIE, pasaporte u otro documento de identidad"));
  else if (guest.documentNumber && normalizedDocument(guest.documentNumber).length > HOSPEDAJES_LIMITS.documentNumber) errors.push(issue("error", "guest.documentNumber.maxLength", "El número de documento es demasiado largo (máximo 15 caracteres)", "documentNumber", guest.sourceRow, "Revisa que el número de documento no tenga espacios ni caracteres extra"));
  if (adult && !guest.documentType) errors.push(issue("error", "guest.documentType.required", "Falta el tipo de documento (obligatorio para mayores de 18 años)", "documentType", guest.sourceRow, "Indica el tipo: NIF (DNI español), NIE (extranjero con residencia), PAS (pasaporte) u OTRO"));
  else if (guest.documentType && !HOSPEDAJES_DOCUMENT_TYPES.has(guest.documentType)) errors.push(issue("error", "guest.documentType.invalid", "Tipo de documento no válido", "documentType", guest.sourceRow, "Usa uno de los tipos admitidos: NIF, NIE, PAS u OTRO"));
  if (!guest.birthDate) errors.push(issue("error", "guest.birthDate.invalid", "Falta la fecha de nacimiento", "birthDate", guest.sourceRow, "Introduce la fecha de nacimiento del huésped"));
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(guest.birthDate) || Number.isNaN(new Date(`${guest.birthDate}T00:00:00Z`).getTime())) errors.push(issue("error", "guest.birthDate.format.invalid", "Formato de fecha de nacimiento incorrecto", "birthDate", guest.sourceRow, "La fecha debe estar en formato AAAA-MM-DD (p.ej. 1985-03-15)"));
  if (!guest.nationalityIso3) errors.push(issue("error", "guest.nationality.required", "Falta la nacionalidad del huésped", "nationalityIso3", guest.sourceRow, "Introduce el código ISO de 3 letras del país de nacionalidad (p.ej. ESP, FRA, DEU)"));
  else if (!/^[A-Za-z]{3}$/.test(guest.nationalityIso3)) errors.push(issue("error", "guest.nationality.iso.invalid", "El código de nacionalidad no es válido", "nationalityIso3", guest.sourceRow, "Usa el código ISO alfa-3 de 3 letras (p.ej. ESP para España, FRA para Francia, DEU para Alemania)"));
  if (guest.sex && !HOSPEDAJES_SEX_VALUES.has(guest.sex)) errors.push(issue("error", "guest.sex.invalid", "El valor del campo sexo no es válido", "sex", guest.sourceRow, "Usa H (hombre), M (mujer) u O (otro)"));
  if (!guest.address) errors.push(issue("error", "guest.address.required", "Falta la dirección de residencia del huésped", "address", guest.sourceRow, "Introduce la dirección completa de residencia habitual del huésped"));
  else if (guest.address.length > HOSPEDAJES_LIMITS.address) errors.push(issue("error", "guest.address.maxLength", "La dirección es demasiado larga (máximo 100 caracteres)", "address", guest.sourceRow, "Abrevia la dirección para que no supere 100 caracteres"));
  if (guest.addressComplement && guest.addressComplement.length > HOSPEDAJES_LIMITS.addressComplement) errors.push(issue("error", "guest.addressComplement.maxLength", "La dirección complementaria es demasiado larga (máximo 100 caracteres)", "addressComplement", guest.sourceRow, "Abrevia la dirección complementaria para que no supere 100 caracteres"));
  if (!guest.postalCode) errors.push(issue("error", "guest.postalCode.required", "Falta el código postal del huésped", "postalCode", guest.sourceRow, "Introduce el código postal de la dirección de residencia del huésped"));
  else if (guest.postalCode.length > HOSPEDAJES_LIMITS.postalCode) errors.push(issue("error", "guest.postalCode.maxLength", "El código postal es demasiado largo (máximo 20 caracteres)", "postalCode", guest.sourceRow, "Revisa que el código postal no tenga espacios ni caracteres extra"));
  if (!countryIso3) errors.push(issue("error", "guest.country.required", "Falta el país de residencia del huésped", "countryIso3", guest.sourceRow, "Introduce el código ISO de 3 letras del país de residencia (p.ej. ESP, FRA, DEU)"));
  else if (!/^[A-Za-z]{3}$/.test(countryIso3)) errors.push(issue("error", "guest.country.iso.invalid", "El código de país no es válido", "countryIso3", guest.sourceRow, "Usa el código ISO alfa-3 de 3 letras (p.ej. ESP para España, FRA para Francia, DEU para Alemania)"));
  if (isSpanishCountry(countryIso3)) {
    if (!guest.municipalityCode) errors.push(issue("error", "guest.municipalityCode.required", "Para residentes en España, falta el código de municipio INE", "municipalityCode", guest.sourceRow, "Busca el código INE del municipio (5 dígitos) en ine.es o selecciónalo desde el buscador de municipios"));
    else if (!/^[0-9]{5}$/.test(guest.municipalityCode)) errors.push(issue("error", "guest.municipalityCode.format", "El código de municipio no tiene el formato correcto", "municipalityCode", guest.sourceRow, "El código INE debe tener exactamente 5 dígitos (p.ej. 46215 para Riola)"));
  } else if (!guest.municipality) {
    errors.push(issue("error", "guest.municipality.required", "Para residentes fuera de España, falta el municipio o ciudad", "municipality", guest.sourceRow, "Introduce el nombre de la ciudad o municipio de residencia del huésped"));
  } else if (guest.municipality.length > HOSPEDAJES_LIMITS.municipalityName) {
    errors.push(issue("error", "guest.municipality.maxLength", "El municipio o ciudad es demasiado largo (máximo 100 caracteres)", "municipality", guest.sourceRow, "Abrevia el nombre del municipio o ciudad"));
  }
  if (requiresSpanishDocumentSupport(guest.documentType) && !guest.documentSupport) errors.push(issue("error", "guest.documentSupport.required", "Para NIF o NIE, el número de soporte del documento es obligatorio", "documentSupport", guest.sourceRow, "Introduce el número de soporte que aparece en el reverso del DNI o en el NIE"));
  if (guest.documentSupport && guest.documentSupport.length > HOSPEDAJES_LIMITS.documentSupport) errors.push(issue("error", "guest.documentSupport.maxLength", "El número de soporte es demasiado largo (máximo 9 caracteres)", "documentSupport", guest.sourceRow, "El número de soporte del DNI/NIE tiene exactamente 9 caracteres alfanuméricos"));
  if (guest.relationship && guest.relationship.length > HOSPEDAJES_LIMITS.relationship) errors.push(issue("error", "guest.relationship.maxLength", "El código de parentesco es demasiado largo (máximo 2 caracteres)", "relationship", guest.sourceRow, "El código de parentesco es siempre de 2 letras (p.ej. HJ para hijo/a, PM para padre/madre)"));
  if (guest.relationship && !HOSPEDAJES_RELATIONSHIP_VALUES.has(guest.relationship.toUpperCase())) errors.push(issue("error", "guest.relationship.invalid", "El parentesco indicado no es válido según el catálogo del Ministerio", "relationship", guest.sourceRow, "Consulta el catálogo TIPO_PARENTESCO del Ministerio. Valores habituales: HJ (hijo/a), PM (padre/madre), AB (abuelo/a), HE (hermano/a)"));
  if (minor && !guest.relationship) errors.push(issue("error", "guest.relationship.requiredForMinor", "Para menores de edad, es obligatorio indicar el parentesco con el adulto acompañante", "relationship", guest.sourceRow, "Indica el parentesco del menor con el adulto que viaja con él (p.ej. HJ si viaja con su padre/madre)"));
  if (!guest.phone && !guest.phone2 && !guest.email) errors.push(issue("error", "guest.contact.required", "Falta el dato de contacto del huésped", "phone", guest.sourceRow, "Introduce al menos un teléfono o dirección de email de contacto"));
  if (guest.phone && guest.phone.length > HOSPEDAJES_LIMITS.phone) errors.push(issue("error", "guest.phone.maxLength", "El teléfono es demasiado largo (máximo 20 caracteres)", "phone", guest.sourceRow, "Elimina espacios o caracteres extra del número de teléfono"));
  if (guest.phone2 && guest.phone2.length > HOSPEDAJES_LIMITS.phone) errors.push(issue("error", "guest.phone2.maxLength", "El segundo teléfono es demasiado largo (máximo 20 caracteres)", "phone2", guest.sourceRow, "Elimina espacios o caracteres extra del segundo número de teléfono"));
  if (guest.email && guest.email.length > HOSPEDAJES_LIMITS.email) errors.push(issue("error", "guest.email.maxLength", "El email es demasiado largo (máximo 250 caracteres)", "email", guest.sourceRow, "Comprueba que el email está bien escrito y no tiene caracteres extra"));
  return { ...guest, validationStatus: statusFrom(errors, warnings), errors, warnings };
}

export function validateParsedExcel(parsed: Omit<ParsedExcel, "validation">): ParsedExcel {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  if (!parsed.reservation.reference) errors.push(issue("error", "reservation.reference.required", "Falta la referencia de la reserva", "reference", undefined, "Introduce el número o código de referencia interno de la reserva"));
  else if (parsed.reservation.reference.length > 50) errors.push(issue("error", "reservation.reference.maxLength", "La referencia de la reserva es demasiado larga (máximo 50 caracteres)", "reference", undefined, "Abrevia la referencia para que no supere 50 caracteres"));
  if (!parsed.reservation.checkInDate || !parsed.reservation.checkOutDate) errors.push(issue("error", "reservation.dates.invalid", "Faltan las fechas de entrada o salida", "dates", undefined, "Comprueba que el archivo Excel incluye las fechas de entrada y salida de la reserva"));
  if (!parsed.reservation.contractDate) errors.push(issue("error", "reservation.contractDate.required", "Falta la fecha de formalización del contrato", "contractDate", undefined, "Introduce la fecha en que se formalizó el contrato de alojamiento"));
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(parsed.reservation.contractDate) || Number.isNaN(new Date(`${parsed.reservation.contractDate}T00:00:00Z`).getTime())) errors.push(issue("error", "reservation.contractDate.format", "Formato de fecha de contrato incorrecto", "contractDate", undefined, "La fecha debe estar en formato AAAA-MM-DD (p.ej. 2026-04-20)"));
  if (!parsed.property.establishmentCode) errors.push(issue("error", "property.establishmentCode.required", "Falta el código del establecimiento del Ministerio", "establishmentCode", undefined, "Introduce el código de establecimiento asignado por el Sistema de Hospedajes al dar de alta el alojamiento"));
  else if (parsed.property.establishmentCode.length > 10) errors.push(issue("error", "property.establishmentCode.maxLength", "El código de establecimiento es demasiado largo (máximo 10 caracteres)", "establishmentCode", undefined, "Comprueba el código de establecimiento en el sistema de Hospedajes del Ministerio"));
  if (!parsed.reservation.guestCount) errors.push(issue("error", "reservation.guestCount.required", "Falta el número de personas de la reserva", "guestCount", undefined, "Indica el número total de personas que se van a hospedar"));
  else if (parsed.reservation.guestCount < 1) errors.push(issue("error", "reservation.guestCount.invalid", "El número de personas debe ser al menos 1", "guestCount", undefined, "Corrige el número de personas para que sea mayor que cero"));
  else if (parsed.reservation.guestCount !== parsed.guests.length) {
    errors.push(issue("error", "reservation.guestCount.mismatch", "El número de personas declarado no coincide con el número de huéspedes del archivo", "guestCount", undefined, "Asegúrate de que el número de personas en la cabecera coincide exactamente con el número de filas de huéspedes"));
  }
  if (!parsed.payment.paymentType) errors.push(issue("error", "payment.type.required", "Falta el tipo de pago de la reserva", "paymentType", undefined, "Indica cómo se ha pagado la reserva"));
  else if (!HOSPEDAJES_PAYMENT_TYPES.has(parsed.payment.paymentType)) {
    errors.push(issue("error", "payment.type.invalid", "Tipo de pago no válido", "paymentType", undefined, "Usa uno de los tipos admitidos: TARJT (tarjeta), EFECT (efectivo), TRANS (transferencia), PLATF (plataforma), MOVIL (móvil), TREG (tarjeta regalo) u OTRO"));
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
        errors.push(issue("error", "guest.document.control.invalid", "La letra de control del NIF/NIE no coincide con el número de documento", "documentNumber", guest.sourceRow, "Verifica que el número y la letra de control del NIF/NIE son correctos. La letra se calcula a partir del número"));
      }
    } else if (guest.documentType === "PAS" && document && !hasReasonablePassportFormat(document)) {
      warnings.push(issue("warning", "guest.passport.format.suspicious", "El número de pasaporte tiene un formato inusual", "documentNumber", guest.sourceRow, "Comprueba que el número de pasaporte está bien transcrito y no tiene espacios ni caracteres especiales"));
    }

    if (guest.email && !isValidEmail(guest.email)) {
      errors.push(issue("error", "guest.email.invalid", "El email no tiene un formato válido", "email", guest.sourceRow, "El email debe tener el formato nombre@dominio.ext (p.ej. juan@ejemplo.com)"));
    }
    if (guest.phone) {
      const digits = normalizedDigits(guest.phone);
      if (digits.length < 7 || digits.length > 15) {
        warnings.push(issue("warning", "guest.phone.format.suspicious", "La longitud del teléfono es inusual", "phone", guest.sourceRow, "Comprueba que el número de teléfono es correcto y tiene entre 7 y 15 dígitos"));
      }
    }
    if (guest.countryIso3 === "ESP" && guest.postalCode && !isValidSpanishPostalCode(guest.postalCode)) {
      errors.push(issue("error", "guest.postalCode.invalid", "El código postal no corresponde a ninguna provincia española", "postalCode", guest.sourceRow, "Los códigos postales españoles tienen 5 dígitos y los dos primeros identifican la provincia (01-52)"));
    }
    if (guest.birthDate && isValidIsoDate(guest.birthDate)) {
      const age = getAge(guest.birthDate);
      if (age !== undefined && age < 0) errors.push(issue("error", "guest.birthDate.future", "La fecha de nacimiento es en el futuro", "birthDate", guest.sourceRow, "Comprueba que el año de nacimiento es correcto"));
      else if (age !== undefined && age > 120) warnings.push(issue("warning", "guest.birthDate.unlikely", "La edad calculada supera los 120 años", "birthDate", guest.sourceRow, "Revisa que el año de nacimiento está bien introducido"));
    }

    return { ...baseGuest, errors, warnings, validationStatus: statusFrom(errors, warnings) };
  });

  const base = validateParsedExcel({ ...parsed, guests });
  const errors = [...base.validation.errors];
  const warnings = [...base.validation.warnings];

  if (base.reservation.checkInDate && base.reservation.checkOutDate && base.reservation.checkInDate >= base.reservation.checkOutDate) {
    errors.push(issue("error", "reservation.dates.order.invalid", "La fecha de salida debe ser posterior a la fecha de entrada", "dates", undefined, "Comprueba que las fechas de entrada y salida son correctas y están en el orden adecuado"));
  }
  if (base.reservation.checkInDate) {
    const checkIn = new Date(`${base.reservation.checkInDate}T00:00:00Z`).getTime();
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    if (!Number.isNaN(checkIn) && checkIn < oneYearAgo) {
      errors.push(issue("error", "reservation.checkInDate.tooOld", "La fecha de entrada es demasiado antigua", "checkInDate", undefined, "El Ministerio solo acepta comunicaciones de reservas con fecha de entrada en los últimos 12 meses"));
    }
  }
  if (base.reservation.checkInTime && !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(base.reservation.checkInTime)) {
    errors.push(issue("error", "reservation.checkInTime.invalid", "La hora de entrada tiene un formato incorrecto", "checkInTime", undefined, "La hora debe estar en formato HH:MM:SS (p.ej. 15:00:00 para las 3 de la tarde)"));
  }
  if (base.reservation.checkOutTime && !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(base.reservation.checkOutTime)) {
    errors.push(issue("error", "reservation.checkOutTime.invalid", "La hora de salida tiene un formato incorrecto", "checkOutTime", undefined, "La hora debe estar en formato HH:MM:SS (p.ej. 11:00:00 para las 11 de la mañana)"));
  }
  if (base.property.countryIso3 && !isValidIso3(base.property.countryIso3)) {
    errors.push(issue("error", "property.country.iso.invalid", "El código de país del establecimiento no es válido", "countryIso3", undefined, "Usa el código ISO alfa-3 de 3 letras mayúsculas (p.ej. ESP para España)"));
  }
  if (base.property.countryIso3 === "ESP" && base.property.postalCode && !isValidSpanishPostalCode(base.property.postalCode)) {
    errors.push(issue("error", "property.postalCode.invalid", "El código postal del establecimiento no es válido", "postalCode", undefined, "Los códigos postales españoles tienen 5 dígitos y los dos primeros identifican la provincia (01-52)"));
  }
  for (const candidate of findIbans(base)) {
    if (!isValidIban(candidate.value)) {
      pushIfMissing(errors, issue("error", "payment.iban.invalid", "El número de cuenta IBAN no es correcto", "iban", candidate.row, "Comprueba que el IBAN está bien transcrito — verifica el país, los dígitos de control y el número de cuenta"));
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
