export const SES_HOSPEDAJES_RULESET_VERSION = "MIR-HOSPE v3.1.3";

export const HOSPEDAJES_LIMITS = {
  establishmentCode: 10,
  reference: 50,
  firstName: 50,
  surname: 50,
  documentType: 5,
  documentNumber: 15,
  documentSupport: 9,
  address: 100,
  addressComplement: 100,
  municipalityCode: 5,
  municipalityName: 100,
  postalCode: 20,
  phone: 20,
  email: 250,
  relationship: 2,
  paymentType: 5,
  paymentMethod: 50,
  paymentHolder: 100,
  cardExpiry: 7,
} as const;

export const HOSPEDAJES_PAYMENT_TYPES = new Set(["DESTI", "EFECT", "TARJT", "PLATF", "TRANS", "MOVIL", "TREG", "OTRO"]);
export const HOSPEDAJES_DOCUMENT_TYPES = new Set(["NIF", "NIE", "PAS", "OTRO"]);
export const HOSPEDAJES_SEX_VALUES = new Set(["H", "M", "O"]);
export const HOSPEDAJES_RELATIONSHIP_VALUES = new Set(["AB", "BA", "CO", "CU", "HE", "HJ", "HR", "NI", "PM", "SB", "SG", "TI", "TU", "OT"]);

export function getAgeOn(date: string, now = new Date()) {
  const birth = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return undefined;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const hadBirthday = now.getUTCMonth() > birth.getUTCMonth()
    || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() >= birth.getUTCDate());
  if (!hadBirthday) age -= 1;
  return age;
}

export function isAdultBirthDate(date?: string) {
  if (!date) return false;
  const age = getAgeOn(date);
  return age !== undefined && age >= 18;
}

export function isMinorBirthDate(date?: string) {
  if (!date) return false;
  const age = getAgeOn(date);
  return age !== undefined && age >= 0 && age < 18;
}

export function isSpanishCountry(countryIso3?: string) {
  return (countryIso3 ?? "").toUpperCase() === "ESP";
}

export function requiresSpanishDocumentSupport(documentType?: string) {
  const type = (documentType ?? "").toUpperCase();
  return type === "NIF" || type === "NIE";
}
