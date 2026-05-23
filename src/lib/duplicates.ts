import type { DuplicateCandidate, GuestRecord, ParsedExcel } from "./domain";

function normalize(value?: string) {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, " ");
}

function key(parts: Array<string | undefined>) {
  return parts.map(normalize).join("|");
}

function addCandidate(map: Map<string, DuplicateCandidate>, id: string, reasonCode: string, rows: number[], classification: "likely" | "possible") {
  const existing = map.get(id);
  if (existing) {
    existing.reasonCodes = Array.from(new Set([...existing.reasonCodes, reasonCode]));
    existing.sourceRows = Array.from(new Set([...existing.sourceRows, ...rows])).sort((a, b) => a - b);
    if (classification === "likely") existing.classification = "likely";
    return;
  }
  map.set(id, { id, classification, reasonCodes: [reasonCode], sourceRows: rows, resolution: "pending" });
}

function scanGuests(guests: GuestRecord[], map: Map<string, DuplicateCandidate>, reasonCode: string, makeKey: (guest: GuestRecord) => string, classification: "likely" | "possible") {
  const seen = new Map<string, number>();
  for (const guest of guests) {
    const value = makeKey(guest);
    if (!value.replace(/\|/g, "")) continue;
    const previous = seen.get(value);
    if (previous) addCandidate(map, `${reasonCode}:${value}`, reasonCode, [previous, guest.sourceRow], classification);
    else seen.set(value, guest.sourceRow);
  }
}

export function detectDuplicates(parsed: ParsedExcel): DuplicateCandidate[] {
  const map = new Map<string, DuplicateCandidate>();
  scanGuests(parsed.guests, map, "same_document_and_arrival", (guest) => key([guest.documentNumber, guest.arrivalDate ?? parsed.reservation.checkInDate]), "likely");
  scanGuests(parsed.guests, map, "same_identity_and_arrival", (guest) => key([guest.firstName, guest.surname1, guest.surname2, guest.birthDate, guest.arrivalDate ?? parsed.reservation.checkInDate]), "possible");
  return Array.from(map.values());
}

export function unresolvedDuplicates(parsed: ParsedExcel) {
  return (parsed.duplicates ?? []).filter((duplicate) => duplicate.classification !== "none" && duplicate.resolution === "pending");
}
