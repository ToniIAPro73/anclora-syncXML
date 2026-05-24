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

// ---------------------------------------------------------------------------
// Common meta rows (property + reservation)
// ---------------------------------------------------------------------------
const META_ESP = [
  ["CODIGO 12345"],
  ["Apartamentos Anclora"],
  ["Calle Mayor 1"],
  ["46812 Riola"],
  ["Valencia"],
  ["REFERENCIA", "CLEAN-2024-001"],
  ["FECHA DE CONTRATO", "15/05/2024"],
  ["FECHA DE ENTRADA", "01/06/2024"],
  ["FECHA DE SALIDA", "08/06/2024"],
  ["HORA", "15:00"],
  ["HORA", "11:00"],
  ["NUMERO DE PERSONAS", "7"],
  ["TIPO DE PAGO", "TARJETA"],
];

const META2 = [
  ["CODIGO 12345"],
  ["Apartamentos Anclora"],
  ["Calle Mayor 1"],
  ["46812 Riola"],
  ["Valencia"],
  ["REFERENCIA", "CLEAN-2024-002"],
  ["FECHA DE CONTRATO", "25/05/2024"],
  ["FECHA DE ENTRADA", "10/06/2024"],
  ["FECHA DE SALIDA", "17/06/2024"],
  ["HORA", "15:00"],
  ["HORA", "11:00"],
  ["NUMERO DE PERSONAS", "8"],
  ["TIPO DE PAGO", "TARJETA"],
];

const META3 = [
  ["CODIGO 12345"],
  ["Apartamentos Anclora"],
  ["Calle Mayor 1"],
  ["46812 Riola"],
  ["Valencia"],
  ["REFERENCIA", "CLEAN-2024-003"],
  ["FECHA DE CONTRATO", "05/06/2024"],
  ["FECHA DE ENTRADA", "20/06/2024"],
  ["FECHA DE SALIDA", "27/06/2024"],
  ["HORA", "15:00"],
  ["HORA", "11:00"],
  ["NUMERO DE PERSONAS", "10"],
  ["TIPO DE PAGO", "TARJETA"],
];

// ---------------------------------------------------------------------------
// Helper: guest row in header order
// ---------------------------------------------------------------------------
function g({ nombre, ap1, ap2 = "", nac, tipo, num, soporte = "", dir = "", muni = "", email, tel, llegada = "01/06/2024", salida = "08/06/2024", parentesco = "OT" }) {
  return [nombre, ap1, ap2, nac, "ESP", tipo, num, soporte, dir, muni, email, tel, llegada, salida, parentesco];
}

// NOTE: column order matches HEADERS
// Nombre | 1.Apellido | 2.Apellido | Fecha nacimiento | Nationality | Tipo doc | Número doc | Soporte doc | Dirección | Código municipio | Email | Teléfono | Fecha llegada | Fecha salida | Parentesco

function row(nombre, ap1, ap2, fNac, nat, tipoDoc, numDoc, soporte, dir, muniCode, email, tel, llegada, salida, parentesco) {
  return [nombre, ap1, ap2, fNac, nat, tipoDoc, numDoc, soporte, dir, muniCode, email, tel, llegada, salida, parentesco];
}

// ---------------------------------------------------------------------------
// TEST 1 CLEAN — Españoles + EU, sin errores
// NIF/NIE → soporte + 2.apellido + CP español + código municipio
// EU PAS/OTRO → dirección con CP extranjero + email/tel
// ---------------------------------------------------------------------------
const GUESTS1 = [
  // ESP NIF: nombre, ap1, ap2, fNac, nat, tipoDoc, numDoc, soporte, dir, muniCode, email, tel, llegada, salida, parentesco
  row("María",   "García",    "López",    "15/03/1985", "ESP", "NIF", "12345678Z", "AAA111111", "Calle Mayor 1, 46812 Riola, Valencia", "46215", "maria@example.com",  "+34600111222", "01/06/2024", "08/06/2024", "TI"),
  row("Pedro",   "Martínez",  "Sánchez",  "22/07/1978", "ESP", "NIF", "33445566R", "BBB222222", "Calle Mayor 1, 46812 Riola, Valencia", "46215", "pedro@example.com",  "+34600333444", "01/06/2024", "08/06/2024", "OT"),
  row("Piotr",   "Kowalski",  "",         "10/05/1990", "ESP", "NIE", "X1234567L", "CCC333333", "Calle Mayor 1, 46812 Riola, Valencia", "46215", "piotr@example.com",  "+34611222333", "01/06/2024", "08/06/2024", "OT"),
  row("Ana",     "Rodríguez", "Pérez",    "08/11/1992", "ESP", "NIF", "11223344B", "DDD444444", "Calle Mayor 1, 46812 Riola, Valencia", "46215", "ana@example.com",    "+34622333444", "01/06/2024", "08/06/2024", "OT"),
  row("Jean",    "Dupont",    "Martin",   "30/04/1982", "FRA", "PAS", "12AB34567", "",          "14 Rue de la Paix, Lyon, 69001",       "",      "jean@example.com",   "+33600112233", "01/06/2024", "08/06/2024", "OT"),
  row("Hans",    "Müller",    "",         "18/09/1975", "DEU", "PAS", "C3T9L5K21","",           "Hauptstraße 42, Berlin, 10115",        "",      "hans@example.com",   "+49151234567", "01/06/2024", "08/06/2024", "OT"),
  row("Giulia",  "Rossi",     "Ferrari",  "05/02/1988", "ITA", "OTRO","CA12345AA", "",          "Via Roma 7, Milano, 20100",            "",      "giulia@example.com", "+39333111222", "01/06/2024", "08/06/2024", "OT"),
];

// ---------------------------------------------------------------------------
// TEST 2 CLEAN — Solo EU, sin errores
// All passports with valid format (≥5 chars, contains digit)
// All have email or phone, all have address with extractable CP
// ---------------------------------------------------------------------------
const GUESTS2 = [
  row("Claire",  "Lefebvre",    "Moreau",   "12/01/1987", "FRA", "PAS", "06AB12345", "", "15 Avenue des Champs-Elysées, Paris, 75009",    "", "claire@example.com",  "+33612345678", "10/06/2024", "17/06/2024", "OT"),
  row("Friedrich","Weber",      "",          "25/06/1970", "DEU", "PAS", "L01X00T47", "", "Kaiserstraße 12, Frankfurt, 60311",              "", "fweber@example.com",  "+49176543210", "10/06/2024", "17/06/2024", "OT"),
  row("Marco",   "Bianchi",    "Conti",     "03/08/1993", "ITA", "PAS", "YA1234567", "", "Corso Buenos Aires 10, Milano, 20124",           "", "marco@example.com",   "+39340987654", "10/06/2024", "17/06/2024", "OT"),
  row("João",    "Silva",      "Costa",     "17/03/1985", "PRT", "PAS", "AB123456",  "", "Rua Augusta 45, Lisboa, 1100-048",               "", "joao@example.com",    "+351912345678","10/06/2024", "17/06/2024", "OT"),
  row("Sophie",  "van den Berg","",          "29/11/1991", "NLD", "PAS", "NX4567890", "", "Herengracht 400, Amsterdam, 1016 BW",           "", "sophie@example.com",  "+31612345678", "10/06/2024", "17/06/2024", "OT"),
  row("Thomas",  "Dubois",     "Lambert",   "14/05/1980", "BEL", "OTRO","590-1234567-29","","Rue Neuve 12, Bruxelles, 1000",               "", "thomas@example.com",  "+32470123456", "10/06/2024", "17/06/2024", "OT"),
  row("Erik",    "Johansson",  "",          "07/07/1995", "SWE", "PAS", "XY1234567", "", "Drottninggatan 10, Stockholm, 111 51",           "", "erik@example.com",    "+46701234567", "10/06/2024", "17/06/2024", "OT"),
  row("Nikos",   "Papadopoulos","Alexiou",  "21/09/1983", "GRC", "PAS", "AE1234567", "", "Ermou 15, Athina, 10563",                       "", "nikos@example.com",   "+30691234567", "10/06/2024", "17/06/2024", "OT"),
];

// ---------------------------------------------------------------------------
// TEST 3 CLEAN — ESP + EU + no-EU, sin errores
// Minor (Diego, born 2015) → relationship HJ (hijo)
// ---------------------------------------------------------------------------
const GUESTS3 = [
  row("Carlos",   "López",     "Fernández", "10/04/1980", "ESP", "NIF", "56789012B", "EEE555555", "Calle Mayor 1, 46812 Riola, Valencia", "46215", "carlos@example.com",   "+34633111222", "20/06/2024", "27/06/2024", "TI"),
  row("Laura",    "Pérez",     "Gómez",     "22/08/1982", "ESP", "NIF", "87654321X", "FFF666666", "Calle Mayor 1, 46812 Riola, Valencia", "46215", "laura@example.com",    "+34644222333", "20/06/2024", "27/06/2024", "CO"),
  row("Diego",    "López",     "Pérez",     "15/03/2015", "ESP", "NIF", "23456789D", "GGG777777", "Calle Mayor 1, 46812 Riola, Valencia", "46215", "carlos@example.com",   "+34633111222", "20/06/2024", "27/06/2024", "HJ"),
  row("Amelie",   "Bernard",   "",          "07/02/1990", "FRA", "PAS", "13FT01234", "",          "15 Cours Belsunce, Marseille, 13001",  "",      "amelie@example.com",   "+33644556677", "20/06/2024", "27/06/2024", "OT"),
  row("Andrei",   "Popescu",   "Ion",       "14/11/1988", "ROU", "PAS", "RO1234567", "",          "Strada Victoriei 20, Bucuresti, 010091","",    "andrei@example.com",   "+40722123456", "20/06/2024", "27/06/2024", "OT"),
  row("John",     "Smith",     "William",   "30/06/1975", "USA", "PAS", "A12345678", "",          "123 Main Street, New York, NY 10001",  "",      "jsmith@example.com",   "+12125551234", "20/06/2024", "27/06/2024", "OT"),
  row("Emma",     "Wilson",    "Brown",     "19/04/1994", "GBR", "PAS", "987654321", "",          "15 Baker Street, London, W1U 8EQ",     "",      "emma@example.com",     "+447911123456","20/06/2024", "27/06/2024", "OT"),
  row("Yuki",     "Tanaka",    "",          "03/01/1986", "JPN", "PAS", "TK1234567", "",          "1-1 Shinjuku, Tokyo, 160-0022",        "",      "yuki@example.com",     "+81901234567", "20/06/2024", "27/06/2024", "OT"),
  row("Mohammed", "Alaoui",    "Benkiran",  "25/09/1979", "MAR", "PAS", "MA1234567", "",          "Rue Mohammed V 7, Casablanca, 20000",  "",      "malaoui@example.com",  "+212661234567","20/06/2024", "27/06/2024", "OT"),
  row("Wei",      "Zhang",     "",          "08/06/2000", "CHN", "OTRO","CHN12345",  "",          "Wangfujing Street 1, Beijing, 100010", "",      "wzhang@example.com",   "+8613912345678","20/06/2024","27/06/2024", "OT"),
];

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------
const files = [
  { name: "test1-clean.xlsx", meta: META_ESP, guests: GUESTS1 },
  { name: "test2-clean.xlsx", meta: META2,    guests: GUESTS2 },
  { name: "test3-clean.xlsx", meta: META3,    guests: GUESTS3 },
];

for (const { name, meta, guests } of files) {
  const wb = makeWorkbook({ meta, guests });
  const outPath = path.join(outDir, name);
  XLSX.writeFile(wb, outPath);
  console.log(`✓ ${name} (${guests.length} guests)`);
}
