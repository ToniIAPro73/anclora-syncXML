import type { ParsedExcel, GuestRecord } from "./domain";

export type AutoCorrection = {
  scope: "reservation" | "payment" | "guest";
  sourceRow?: number;
  field: string;
  fieldLabel: string;
  from: string;
  to: string;
};

export type AutoCorrectionResult = {
  data: ParsedExcel;
  corrections: AutoCorrection[];
};

// Convert DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD.
// Returns null if the input does not match, preserving any other format.
function parseDMY(value: string): string | null {
  const m = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function trimStr(v: string | undefined): string | undefined {
  if (v === undefined) return undefined;
  const t = v.trim();
  return t === "" && v === "" ? v : t || undefined;
}

function upperStr(v: string | undefined): string | undefined {
  return v === undefined ? undefined : v.trim().toUpperCase() || undefined;
}

function normalizeDate(v: string | undefined): string | undefined {
  if (!v) return v;
  const trimmed = v.trim();
  const converted = parseDMY(trimmed);
  return converted ?? (trimmed || undefined);
}

function padPostalCode(v: string | undefined): string | undefined {
  if (!v) return v;
  const trimmed = v.trim();
  if (/^\d{1,4}$/.test(trimmed)) return trimmed.padStart(5, "0");
  return trimmed || undefined;
}

function normalizeIban(v: string | undefined): string | undefined {
  if (!v) return v;
  return v.trim().replace(/\s+/g, "").toUpperCase() || undefined;
}

type Corrector<T> = {
  field: keyof T;
  label: string;
  transform: (v: string | undefined) => string | undefined;
};

function applyCorrectorsToGuest(
  guest: GuestRecord,
  correctors: Corrector<GuestRecord>[],
  corrections: AutoCorrection[],
): GuestRecord {
  let changed = { ...guest };
  for (const { field, label, transform } of correctors) {
    const original = guest[field] as string | undefined;
    const next = transform(original);
    if (next !== original) {
      corrections.push({
        scope: "guest",
        sourceRow: guest.sourceRow,
        field: String(field),
        fieldLabel: label,
        from: original ?? "",
        to: next ?? "",
      });
      (changed as Record<string, unknown>)[field as string] = next;
    }
  }
  return changed;
}

const GUEST_CORRECTORS: Corrector<GuestRecord>[] = [
  { field: "firstName",          label: "Nombre",              transform: trimStr },
  { field: "surname1",           label: "Primer apellido",     transform: trimStr },
  { field: "surname2",           label: "Segundo apellido",    transform: trimStr },
  { field: "documentNumber",     label: "Número de documento", transform: (v) => v?.trim().toUpperCase() || undefined },
  { field: "documentSupport",    label: "Soporte de documento",transform: upperStr },
  { field: "documentType",       label: "Tipo de documento",   transform: upperStr },
  { field: "nationalityIso3",    label: "Nacionalidad",        transform: upperStr },
  { field: "countryIso3",        label: "País de domicilio",   transform: upperStr },
  { field: "sex",                label: "Sexo",                transform: upperStr },
  { field: "postalCode",         label: "Código postal",       transform: padPostalCode },
  { field: "address",            label: "Dirección",           transform: trimStr },
  { field: "addressComplement",  label: "Complemento dirección", transform: trimStr },
  { field: "municipality",       label: "Municipio",           transform: trimStr },
  { field: "phone",              label: "Teléfono",            transform: trimStr },
  { field: "phone2",             label: "Teléfono 2",          transform: trimStr },
  { field: "email",              label: "Email",               transform: trimStr },
  { field: "birthDate",          label: "Fecha de nacimiento", transform: normalizeDate },
  { field: "arrivalDate",        label: "Fecha de entrada",    transform: normalizeDate },
  { field: "departureDate",      label: "Fecha de salida",     transform: normalizeDate },
];

export function autoCorrectParsedExcel(input: ParsedExcel): AutoCorrectionResult {
  const corrections: AutoCorrection[] = [];

  // --- Reservation ---
  const res = { ...input.reservation };
  function correctRes(field: keyof typeof res, label: string, transform: (v: string | undefined) => string | undefined) {
    const original = res[field] as string | undefined;
    const next = transform(original);
    if (next !== original) {
      corrections.push({ scope: "reservation", field: String(field), fieldLabel: label, from: original ?? "", to: next ?? "" });
      (res as Record<string, unknown>)[field as string] = next;
    }
  }
  correctRes("reference",    "Referencia",          trimStr);
  correctRes("channel",      "Canal",               trimStr);
  correctRes("checkInDate",  "Fecha de entrada",    normalizeDate);
  correctRes("checkOutDate", "Fecha de salida",     normalizeDate);
  correctRes("contractDate", "Fecha de contrato",   normalizeDate);
  correctRes("checkInTime",  "Hora de entrada",     trimStr);
  correctRes("checkOutTime", "Hora de salida",      trimStr);

  // --- Payment ---
  const pay = { ...input.payment };
  function correctPay(field: keyof typeof pay, label: string, transform: (v: string | undefined) => string | undefined) {
    const original = pay[field] as string | undefined;
    const next = transform(original);
    if (next !== original) {
      corrections.push({ scope: "payment", field: String(field), fieldLabel: label, from: original ?? "", to: next ?? "" });
      (pay as Record<string, unknown>)[field as string] = next;
    }
  }
  correctPay("iban",          "IBAN",               normalizeIban);
  correctPay("paymentHolder", "Titular del pago",   trimStr);
  correctPay("paymentType",   "Tipo de pago",       upperStr);
  correctPay("paymentMethod", "Método de pago",     upperStr);

  // --- Guests ---
  const correctedGuests = input.guests.map((g) =>
    applyCorrectorsToGuest(g, GUEST_CORRECTORS, corrections),
  );

  return {
    corrections,
    data: {
      ...input,
      reservation: res,
      payment: pay,
      guests: correctedGuests,
    },
  };
}
