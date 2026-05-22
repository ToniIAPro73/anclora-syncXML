import * as XLSX from "xlsx";
import type { ParsedExcel } from "../domain";
import { cleanText, extractPostalCode, normalizeDocumentType, normalizeNationality, normalizePaymentType, normalizePhone, normalizeTime, parseDate } from "../normalizers";
import { validateGuest, validateParsedExcel } from "../validation";

const HEADER_NAMES = [
  "Nombre",
  "1. Apellido",
  "Fecha de nacimiento",
  "Nationality",
  "Tipo de documento de identidad",
  "Número de documento",
];

function get(row: string[], header: string[], name: string): string {
  const idx = header.findIndex((item) => item.toLowerCase() === name.toLowerCase());
  return idx >= 0 ? cleanText(row[idx]) : "";
}

function isGuestHeader(row: string[]) {
  const joined = row.map(cleanText);
  return HEADER_NAMES.every((name) => joined.includes(name));
}

function isGuestRow(row: string[], header: string[]) {
  return Boolean(get(row, header, "Nombre") && get(row, header, "1. Apellido") && get(row, header, "Número de documento"));
}

export function parseExcelBuffer(buffer: Buffer, fileName?: string): ParsedExcel {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const rawRows: ParsedExcel["rawRows"] = [];
  const ignoredRows: ParsedExcel["ignoredRows"] = [];
  const guests = [];
  const reservation: ParsedExcel["reservation"] = { roomCount: 1, internet: true };
  const property: ParsedExcel["property"] = { countryIso3: "ESP" };
  const payment: ParsedExcel["payment"] = {};

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: "", raw: false });
    const headerIndex = rows.findIndex(isGuestHeader);
    const header = headerIndex >= 0 ? rows[headerIndex].map(cleanText) : [];
    rows.forEach((row, idx) => rawRows.push({ rowNumber: idx + 1, values: row.map(cleanText) }));

    if (headerIndex >= 0) {
      for (let i = headerIndex + 1; i < rows.length; i += 1) {
        const row = rows[i].map(cleanText);
        if (isGuestRow(row, header)) {
          const address = get(row, header, "Dirección de residencia");
          const nationality = normalizeNationality(get(row, header, "Nationality"));
          guests.push(validateGuest({
            sourceRow: i + 1,
            role: "VI",
            firstName: get(row, header, "Nombre"),
            surname1: get(row, header, "1. Apellido"),
            surname2: get(row, header, "2. Apellido") || undefined,
            birthDate: parseDate(get(row, header, "Fecha de nacimiento")),
            nationalityIso3: nationality,
            documentType: normalizeDocumentType(get(row, header, "Tipo de documento de identidad")),
            documentNumber: get(row, header, "Número de documento").toUpperCase() || undefined,
            email: get(row, header, "Correo electrónico") || undefined,
            phone: normalizePhone(get(row, header, "Número de teléfono")),
            address,
            postalCode: extractPostalCode(address),
            countryIso3: nationality === "ESP" ? "ESP" : nationality,
            arrivalDate: parseDate(get(row, header, "Fecha de llegada")),
            departureDate: parseDate(get(row, header, "Fecha de salida")),
            relationship: get(row, header, "Parentesco") || undefined,
          }));
        } else if (row.some(Boolean)) {
          const key = row[0].toUpperCase();
          const value = row[1] || "";
          if (key.startsWith("CODIGO")) property.establishmentCode = key.replace(/[^0-9]/g, "") || value.replace(/[^0-9]/g, "");
          else if (!property.name && i > headerIndex && row[0] && rows[i - 1]?.[0]?.toUpperCase().startsWith("CODIGO")) property.name = row[0];
          else if (property.name && !property.address && row[0] && !row[0].includes("REFERENCIA")) property.address = row[0];
          else if (property.address && !property.postalCode) {
            property.postalCode = extractPostalCode(row[0]);
            property.municipality = row[0].replace(/\b\d{5}\b/, "").trim() || undefined;
          } else if (property.postalCode && !property.province) property.province = row[0];
          else if (property.province && !property.countryIso3) property.countryIso3 = normalizeNationality(row[0]);
          else if (key === "REFERENCIA") reservation.reference = value;
          else if (key === "FECHA DE ENTRADA") reservation.checkInDate = parseDate(value);
          else if (key === "FECHA DE SALIDA") reservation.checkOutDate = parseDate(value);
          else if (key === "HORA" && reservation.checkInDate && !reservation.checkInTime) reservation.checkInTime = normalizeTime(value);
          else if (key === "HORA" && reservation.checkInTime && !reservation.checkOutTime) reservation.checkOutTime = normalizeTime(value);
          else if (key === "FECHA DE CONTRATO") reservation.contractDate = parseDate(value);
          else if (key === "NUMERO DE PERSONAS") reservation.guestCount = Number.parseInt(value, 10);
          else if (key === "TIPO DE PAGO") payment.paymentType = normalizePaymentType(value);
          else ignoredRows.push({ rowNumber: i + 1, values: row, reason: "No clasificada" });
        }
      }
    }
  }

  if (!payment.paymentType) payment.paymentType = "OTRO";
  if (!reservation.guestCount) reservation.guestCount = guests.length;
  const parsed = { fileName, sheets: workbook.SheetNames, reservation, property, payment, guests, ignoredRows, rawRows };
  return validateParsedExcel(parsed);
}
