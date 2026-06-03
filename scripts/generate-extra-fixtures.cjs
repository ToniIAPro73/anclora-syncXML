// @ts-check
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const outDir = path.join(__dirname, "..", "test-data");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const HEADERS = [
  "Nombre",
  "1. Apellido",
  "2. Apellido",
  "Fecha de nacimiento",
  "Nationality",
  "Tipo de documento de identidad",
  "Número de documento",
  "Soporte de documento",
  "Dirección de residencia",
  "Código municipio",
  "Correo electrónico",
  "Número de teléfono",
  "Fecha de llegada",
  "Fecha de salida",
  "Parentesco",
];

function makeSheet(metaRows, guestRows) {
  const rows = [...metaRows, HEADERS, ...guestRows];
  return XLSX.utils.aoa_to_sheet(rows);
}

function makeWorkbook(sheetData) {
  const wb = XLSX.utils.book_new();
  const ws = makeSheet(sheetData.meta, sheetData.guests);
  XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
  return wb;
}

const META_EFECTIVO = [
  ["CODIGO 0000004630"],
  ["Apartamentos Anclora"],
  ["Calle Mayor 1"],
  ["46812 Riola"],
  ["Valencia"],
  ["REFERENCIA", "EFECTIVO-2024"],
  ["FECHA DE CONTRATO", "15/05/2024"],
  ["FECHA DE ENTRADA", "01/06/2024"],
  ["FECHA DE SALIDA", "02/06/2024"],
  ["HORA", "15:00"],
  ["HORA", "11:00"],
  ["NUMERO DE PERSONAS", "1"],
  ["TIPO DE PAGO", "EFECTIVO"],
];

const META_MINIMAL = [
  ["CODIGO 0000004630"],
  ["Apartamentos Anclora"],
  ["Calle Mayor 1"],
  ["46812 Riola"],
  ["Valencia"],
  ["REFERENCIA", "MINIMAL-2024"],
  ["FECHA DE CONTRATO", "15/05/2024"],
  ["FECHA DE ENTRADA", "01/06/2024"],
  ["FECHA DE SALIDA", "02/06/2024"],
  ["HORA", "15:00"],
  ["HORA", "11:00"],
  ["NUMERO DE PERSONAS", "1"],
  ["TIPO DE PAGO", "TARJETA"],
];

function row(nombre, ap1, ap2, fNac, nat, tipoDoc, numDoc, soporte, dir, muniCode, email, tel, llegada, salida, parentesco) {
  return [nombre, ap1, ap2, fNac, nat, tipoDoc, numDoc, soporte, dir, muniCode, email, tel, llegada, salida, parentesco];
}

const GUESTS_EFECTIVO = [
  row("Carlos", "García", "", "15/03/1985", "ESP", "NIF", "12345678Z", "AAA111111", "Calle Mayor 1", "46215", "", "+34600111222", "01/06/2024", "02/06/2024", "TI"),
];

const GUESTS_MINIMAL = [
  row("Jane", "Doe", "", "15/03/1985", "USA", "PAS", "12345678Z", "", "Main St 1", "", "", "", "01/06/2024", "02/06/2024", "TI"),
];

const files = [
  { name: "test10-pago-efectivo.xlsx", meta: META_EFECTIVO, guests: GUESTS_EFECTIVO },
  { name: "test11-pago-tarjeta-minimo.xlsx", meta: META_MINIMAL, guests: GUESTS_MINIMAL },
];

for (const { name, meta, guests } of files) {
  const wb = makeWorkbook({ meta, guests });
  const outPath = path.join(outDir, name);
  XLSX.writeFile(wb, outPath);
  console.log(`✓ ${name} (${guests.length} guests)`);
}
