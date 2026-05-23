import type { ParsedExcel } from "@/lib/domain";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function formatXmlDownloadTimestamp(date = new Date()) {
  return [
    pad2(date.getDate()),
    pad2(date.getMonth() + 1),
    pad2(date.getFullYear() % 100),
    pad2(date.getHours()),
    pad2(date.getMinutes()),
    pad2(date.getSeconds()),
  ].join("");
}

function cleanFileNamePart(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getXmlDownloadReservationNumber(parsed?: Pick<ParsedExcel, "reservation" | "property"> | null) {
  return parsed?.reservation.reference ?? parsed?.property.establishmentCode;
}

export function buildXmlDownloadFileName(
  parsed?: Pick<ParsedExcel, "reservation" | "property"> | null,
  date = new Date(),
) {
  const reservationNumber = cleanFileNamePart(getXmlDownloadReservationNumber(parsed) ?? "sin-reserva");
  return `syncxml-${reservationNumber}-${formatXmlDownloadTimestamp(date)}.xml`;
}
