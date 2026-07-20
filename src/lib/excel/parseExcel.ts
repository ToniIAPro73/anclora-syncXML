import ExcelJS from "exceljs";
import type { ParsedExcel } from "../domain";
import { cleanText, extractPostalCode, extractResidenceMunicipality, extractResidencePostalCode, normalizeDocumentType, normalizeNationality, normalizePaymentType, normalizePhone, normalizeTime, parseDate } from "../normalizers";
import { validateGuest, validateParsedExcel } from "../validation";
import { detectDuplicates } from "../duplicates";

export const EXCEL_PARSE_LIMITS = {
  maxSheets: 8,
  maxRowsPerSheet: 500,
  maxColumnsPerRow: 80,
} as const;

export class ExcelParseLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExcelParseLimitError";
  }
}

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
  return Boolean(get(row, header, "Nombre") && get(row, header, "1. Apellido") && (get(row, header, "Número de documento") || get(row, header, "Fecha de nacimiento")));
}

function cellToValue(cell: ExcelJS.Cell) {
  const value = cell.value;
  if (value instanceof Date) return value;
  if (value && typeof value === "object") {
    if ("result" in value) return value.result;
    if ("text" in value) return value.text;
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((item) => item.text).join("");
    }
  }
  return cell.text || value || "";
}

function rowToValues(row: ExcelJS.Row) {
  const values: unknown[] = [];
  for (let col = 1; col <= row.cellCount; col += 1) {
    values.push(cellToValue(row.getCell(col)));
  }
  return values.map(cleanText);
}

function parseCsvRows(buffer: Buffer) {
  return buffer
    .toString("utf8")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.split(/[,;]/).map(cleanText));
}

async function readWorkbookRows(buffer: Buffer, fileName?: string) {
  if (fileName?.toLowerCase().endsWith(".csv")) {
    return [{ name: fileName, rows: parseCsvRows(buffer) }];
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as ArrayBuffer, {
    ignoreNodes: ["dataValidations", "conditionalFormatting", "hyperlinks", "drawing"],
  });
  if (workbook.worksheets.length > EXCEL_PARSE_LIMITS.maxSheets) {
    throw new ExcelParseLimitError(`Workbook has more than ${EXCEL_PARSE_LIMITS.maxSheets} sheets`);
  }
  return workbook.worksheets.map((worksheet) => {
    if (worksheet.rowCount > EXCEL_PARSE_LIMITS.maxRowsPerSheet) {
      throw new ExcelParseLimitError(`Sheet has more than ${EXCEL_PARSE_LIMITS.maxRowsPerSheet} rows`);
    }
    if (worksheet.columnCount > EXCEL_PARSE_LIMITS.maxColumnsPerRow) {
      throw new ExcelParseLimitError(`Sheet has more than ${EXCEL_PARSE_LIMITS.maxColumnsPerRow} columns`);
    }
    const rows: string[][] = [];
    for (let rowNumber = 1; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      const values = rowToValues(row);
      if (values.length > EXCEL_PARSE_LIMITS.maxColumnsPerRow) {
        throw new ExcelParseLimitError(`Sheet has more than ${EXCEL_PARSE_LIMITS.maxColumnsPerRow} columns`);
      }
      rows.push(values);
    }
    return { name: worksheet.name, rows };
  });
}

export async function parseExcelBuffer(buffer: Buffer, fileName?: string): Promise<ParsedExcel> {
  const sheets = await readWorkbookRows(buffer, fileName);
  const rawRows: ParsedExcel["rawRows"] = [];
  const ignoredRows: ParsedExcel["ignoredRows"] = [];
  const guests = [];
  const reservation: ParsedExcel["reservation"] = { roomCount: 1, internet: true };
  const property: ParsedExcel["property"] = { countryIso3: "ESP" };
  const payment: ParsedExcel["payment"] = {};

  for (const sheet of sheets) {
    const rows = sheet.rows;
    if (rows.length > EXCEL_PARSE_LIMITS.maxRowsPerSheet) {
      throw new ExcelParseLimitError(`Sheet has more than ${EXCEL_PARSE_LIMITS.maxRowsPerSheet} rows`);
    }
    if (rows.some((row) => row.length > EXCEL_PARSE_LIMITS.maxColumnsPerRow)) {
      throw new ExcelParseLimitError(`Sheet has more than ${EXCEL_PARSE_LIMITS.maxColumnsPerRow} columns`);
    }
    const headerIndex = rows.findIndex(isGuestHeader);
    const header = headerIndex >= 0 ? rows[headerIndex].map(cleanText) : [];
    rows.forEach((row, idx) => rawRows.push({ rowNumber: idx + 1, values: row.map(cleanText) }));

    if (headerIndex >= 0) {
      for (let i = 0; i < headerIndex; i += 1) {
        const row = rows[i].map(cleanText);
        if (!row.some(Boolean)) continue;
        const key = row[0].toUpperCase();
        const value = row[1] || "";
        if (key.startsWith("CODIGO")) property.establishmentCode = key.replace(/[^0-9]/g, "") || value.replace(/[^0-9]/g, "");
        else if (!property.name && row[0] && rows[i - 1]?.[0]?.toUpperCase().startsWith("CODIGO")) property.name = row[0];
        else if (property.name && !property.address && row[0] && !row[0].includes("REFERENCIA")) property.address = row[0];
        else if (property.address && !property.postalCode) {
          property.postalCode = extractPostalCode(row[0]);
          property.municipality = row[0].replace(/\b\d{5}\b/, "").trim() || undefined;
        } else if (property.postalCode && !property.province) property.province = row[0];
        else if (key === "REFERENCIA") reservation.reference = value;
        else if (key === "FECHA DE ENTRADA") reservation.checkInDate = parseDate(value);
        else if (key === "FECHA DE SALIDA") reservation.checkOutDate = parseDate(value);
        else if (key === "HORA" && reservation.checkInDate && !reservation.checkInTime) reservation.checkInTime = normalizeTime(value);
        else if (key === "HORA" && reservation.checkInTime && !reservation.checkOutTime) reservation.checkOutTime = normalizeTime(value);
        else if (key === "FECHA DE CONTRATO") reservation.contractDate = parseDate(value);
        else if (key === "NUMERO DE PERSONAS") reservation.guestCount = Number.parseInt(value, 10);
        else if (key === "TIPO DE PAGO") payment.paymentType = normalizePaymentType(value);
        else if (key.includes("IBAN")) payment.iban = value.replace(/\s+/g, "").toUpperCase();
        else ignoredRows.push({ rowNumber: i + 1, values: row, reason: "No clasificada" });
      }

      for (let i = headerIndex + 1; i < rows.length; i += 1) {
        const row = rows[i].map(cleanText);
        if (isGuestRow(row, header)) {
          const address = get(row, header, "Dirección de residencia");
          const nationality = normalizeNationality(get(row, header, "Nationality"));
          const countryIso3 = nationality === "ESP" ? "ESP" : nationality;
          const postalCode = extractResidencePostalCode(address, countryIso3);
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
            documentSupport: get(row, header, "Soporte de documento") || undefined,
            email: get(row, header, "Correo electrónico") || undefined,
            phone: normalizePhone(get(row, header, "Número de teléfono")),
            address,
            municipality: extractResidenceMunicipality(address, countryIso3, postalCode),
            municipalityCode: get(row, header, "Código municipio") || undefined,
            postalCode,
            countryIso3,
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
          else if (key.includes("IBAN")) payment.iban = value.replace(/\s+/g, "").toUpperCase();
          else ignoredRows.push({ rowNumber: i + 1, values: row, reason: "No clasificada" });
        }
      }
    }
  }

  if (!payment.paymentType) payment.paymentType = "OTRO";
  if (!reservation.guestCount) reservation.guestCount = guests.length;
  const parsed = { fileName, sheets: sheets.map((sheet) => sheet.name), reservation, property, payment, guests, ignoredRows, rawRows };
  const validated = validateParsedExcel(parsed);
  return { ...validated, duplicates: detectDuplicates(validated) };
}
