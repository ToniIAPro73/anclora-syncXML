import type { ParsedExcel, ValidationIssue } from "./domain";
import { formatXmlDownloadTimestamp } from "./xml/fileName";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvRow(values: unknown[]) {
  return values.map(csvCell).join(";");
}

function issueRows(scope: string, issues: ValidationIssue[]) {
  return issues.map((issue) => csvRow([
    "incidencia",
    scope,
    issue.severity,
    issue.code,
    issue.sourceRow ?? "",
    issue.field ?? "",
    issue.message,
  ]));
}

export function buildValidationReportCsv(parsed: ParsedExcel) {
  const rows = [
    csvRow(["tipo", "ambito", "severidad", "codigo", "fila", "campo", "mensaje"]),
    csvRow(["reserva", parsed.reservation.reference ?? "", parsed.validation.status, "", "", "referencia", parsed.reservation.reference ?? ""]),
    csvRow(["reserva", parsed.property.name ?? "", "", "", "", "establecimiento", parsed.property.establishmentCode ?? ""]),
    csvRow(["reserva", parsed.reservation.checkInDate ?? "", "", "", "", "entrada", parsed.reservation.checkInTime ?? ""]),
    csvRow(["reserva", parsed.reservation.checkOutDate ?? "", "", "", "", "salida", parsed.reservation.checkOutTime ?? ""]),
    ...issueRows("reserva", parsed.validation.errors),
    ...issueRows("reserva", parsed.validation.warnings),
  ];

  for (const guest of parsed.guests) {
    rows.push(csvRow([
      "huesped",
      `${guest.firstName} ${guest.surname1}`.trim(),
      guest.validationStatus,
      "",
      guest.sourceRow,
      "estado",
      guest.validationStatus,
    ]));
    rows.push(...issueRows("huesped", guest.errors));
    rows.push(...issueRows("huesped", guest.warnings));
  }

  for (const duplicate of parsed.duplicates ?? []) {
    rows.push(csvRow([
      "duplicado",
      duplicate.classification,
      duplicate.resolution === "pending" ? "warning" : "info",
      duplicate.reasonCodes.join("|"),
      duplicate.sourceRows.join("|"),
      "resolution",
      duplicate.resolution,
    ]));
  }

  return `${rows.join("\n")}\n`;
}

export function buildValidationReportFileName(parsed: Pick<ParsedExcel, "reservation">, date = new Date()) {
  const reference = (parsed.reservation.reference ?? "sin-reserva").replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `syncxml-validacion-${reference}-${formatXmlDownloadTimestamp(date)}.csv`;
}
