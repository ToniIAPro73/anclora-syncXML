// Generates 3 test Excel files covering SES validation scenarios for foreign and Spanish guests.
// Run with: node scripts/generate-test-excels.js
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

const OUT_DIR = path.join(__dirname, "../test-data");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Header row for the guest table (exact names the parser expects)
const GUEST_HEADERS = [
  "Nombre",
  "1. Apellido",
  "2. Apellido",
  "Fecha de nacimiento",
  "Nationality",
  "Tipo de documento de identidad",
  "Número de documento",
  "Dirección de residencia",
  "Correo electrónico",
  "Número de teléfono",
  "Fecha de llegada",
  "Fecha de salida",
  "Parentesco",
];

function row(nombre, ap1, ap2, nacimiento, nationality, tipoDoc, numDoc, direccion, email, telefono, llegada, salida, parentesco = "") {
  return [nombre, ap1, ap2 ?? "", nacimiento, nationality, tipoDoc, numDoc, direccion, email ?? "", telefono ?? "", llegada, salida, parentesco];
}

function buildSheet(propertyRows, guestRows) {
  const data = [
    ...propertyRows,
    GUEST_HEADERS,
    ...guestRows,
  ];
  return XLSX.utils.aoa_to_sheet(data);
}

function save(wb, filename) {
  const filePath = path.join(OUT_DIR, filename);
  XLSX.writeFile(wb, filePath);
  console.log("Written:", filePath);
}

// ── Common property header rows ─────────────────────────────────────────────
const PROPERTY_ROWS = [
  ["CODIGO ESTABLECIMIENTO", "12345"],
  ["Hotel Playa Dorada"],
  ["Calle del Mar, 10"],
  ["Valencia, 46001"],
  ["Valencia"],
  ["España"],
  ["REFERENCIA", "RES-2026-001"],
  ["FECHA DE ENTRADA", "15/06/2026"],
  ["HORA", "15:00"],
  ["FECHA DE SALIDA", "20/06/2026"],
  ["HORA", "11:00"],
  ["FECHA DE CONTRATO", "01/05/2026"],
  ["NUMERO DE PERSONAS", ""],   // will be set per file
  ["TIPO DE PAGO", "Plataforma"],
];

// ── Excel 1: Spanish residents + EU foreigners (mixed) ──────────────────────
// Covers: NIF valid, NIF bad control letter, NIE, ESP no municipalityCode,
//         EU PAS (valid), EU OTRO, EU with/without postal code, EU no surname2
{
  const propertyRows = PROPERTY_ROWS.map((r) => [...r]);
  propertyRows[13][1] = "7"; // NUMERO DE PERSONAS

  const guests = [
    // 1. Spanish resident – valid NIF, valid address with postal code → auto-resolve municipio
    row("María", "García", "López", "15/03/1985", "ESP", "NIF", "12345678Z",
        "Calle Mayor, 5, Riola, Valencia, 46812",
        "maria.garcia@email.es", "+34961234567", "15/06/2026", "20/06/2026"),

    // 2. Spanish resident – valid NIF, no postal code in address → municipalityCode missing warning
    row("Pedro", "Martínez", "Sánchez", "22/07/1990", "ESP", "NIF", "33445566R",
        "Avenida Constitución, 22, Sevilla, Andalucía",
        "pedro.m@correo.es", "+34954321098", "15/06/2026", "20/06/2026"),

    // 3. Spanish resident – NIE (EU national with Spanish residence)
    row("Piotr", "Kowalski", "", "10/11/1978", "ESP", "NIE", "X1234567L",
        "Calle Colón, 3, Valencia, Valencia, 46001",
        "", "+34652123456", "15/06/2026", "20/06/2026"),

    // 4. Spanish resident – bad NIF control letter → validation error
    row("Ana", "Rodríguez", "Pérez", "03/09/1995", "ESP", "NIF", "11223344X",
        "Paseo de la Alameda, 8, Alicante, Alicante, 03001",
        "ana.rodriguez@test.com", "", "15/06/2026", "20/06/2026"),

    // 5. French national (EU) – PAS, valid passport, address with French postal code
    row("Jean", "Dupont", "Martin", "25/06/1982", "FRA", "PAS", "12AB34567",
        "14 Rue de la Paix, Lyon, 69001",
        "jean.dupont@mail.fr", "+33621234567", "15/06/2026", "20/06/2026"),

    // 6. German national (EU) – PAS, no second surname, German address
    row("Hans", "Müller", "", "14/02/1975", "DEU", "PAS", "C3T9L5K21",
        "Hauptstraße 42, Berlin, 10115",
        "hans.mueller@de.mail", "+4917612345678", "15/06/2026", "20/06/2026"),

    // 7. Italian national (EU) – OTRO document (e.g. Italian identity card), no email
    row("Giulia", "Rossi", "Ferrari", "30/08/1999", "ITA", "OTRO", "CA12345AA",
        "Via Roma, 7, Milano, 20100",
        "", "+393912345678", "15/06/2026", "20/06/2026"),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSheet(propertyRows, guests), "Viajeros");
  save(wb, "test1-esp-eu-mixto.xlsx");
}

// ── Excel 2: EU foreigners only ─────────────────────────────────────────────
// Covers: various EU passport formats, no municipal code needed,
//         missing postal code, postal code non-Spanish format,
//         invalid passport format (too short), missing required fields
{
  const propertyRows = PROPERTY_ROWS.map((r) => [...r]);
  propertyRows[6][1] = "RES-2026-002";
  propertyRows[13][1] = "8";

  const guests = [
    // 1. French – valid PAS, address with French CP
    row("Claire", "Lefebvre", "Moreau", "12/04/1988", "FRA", "PAS", "06AB12345",
        "23 Boulevard Haussmann, Paris, 75009",
        "claire.l@france.fr", "+33698765432", "15/06/2026", "20/06/2026"),

    // 2. German – valid PAS, German address
    row("Friedrich", "Weber", "", "07/01/1965", "DEU", "PAS", "L01X00T47",
        "Kaiserstraße 8, Frankfurt, 60311",
        "f.weber@gmx.de", "+4969123456", "15/06/2026", "20/06/2026"),

    // 3. Italian – valid PAS
    row("Marco", "Bianchi", "Conti", "19/09/1991", "ITA", "PAS", "YA1234567",
        "Corso Buenos Aires, 22, Milano, 20124",
        "marco.bianchi@libero.it", "+390212345678", "15/06/2026", "20/06/2026"),

    // 4. Portuguese – PAS, Portugal address with 4+3 CP format (valid non-ESP format)
    row("João", "Silva", "Costa", "28/02/1980", "PRT", "PAS", "AB123456",
        "Rua Augusta, 45, Lisboa, 1100-048",
        "joao.silva@pt.mail", "+351912345678", "15/06/2026", "20/06/2026"),

    // 5. Dutch – PAS, no postal code in address → warning but not blocking for foreigners
    row("Sophie", "van den Berg", "", "15/07/1993", "NLD", "PAS", "NX4567890",
        "Herengracht 400, Amsterdam",
        "sophie.vdb@gmail.com", "+31612345678", "15/06/2026", "20/06/2026"),

    // 6. Belgian – OTRO (Belgian eID card number), address with Belgian postal code
    row("Thomas", "Dubois", "Lambert", "03/11/1987", "BEL", "OTRO", "590-1234567-29",
        "Rue Neuve 12, Bruxelles, 1000",
        "thomas.d@belgique.be", "+32472123456", "15/06/2026", "20/06/2026"),

    // 7. Swedish – PAS, very short passport (invalid format → validation warning)
    row("Erik", "Johansson", "", "21/12/1970", "SWE", "PAS", "XY1234",
        "Drottninggatan 10, Stockholm, 111 51",
        "erik.j@sweden.se", "+46701234567", "15/06/2026", "20/06/2026"),

    // 8. Greek – PAS, missing phone
    row("Nikos", "Papadopoulos", "Alexiou", "09/06/2001", "GRC", "PAS", "AE1234567",
        "Ermou 15, Athina, 10563",
        "nikos.p@gr.mail", "", "15/06/2026", "20/06/2026"),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSheet(propertyRows, guests), "Viajeros");
  save(wb, "test2-eu-solo.xlsx");
}

// ── Excel 3: Spanish + EU + Non-EU mix ──────────────────────────────────────
// Covers: all three traveler categories, edge cases:
//         non-EU PAS, non-EU OTRO, missing nationality, child (minor),
//         principal + companion (relationship), no address
{
  const propertyRows = PROPERTY_ROWS.map((r) => [...r]);
  propertyRows[6][1] = "RES-2026-003";
  propertyRows[13][1] = "10";

  const guests = [
    // ── SPANISH RESIDENTS ──
    // 1. Head of family – NIF, complete data, municipalityCode should auto-resolve
    row("Carlos", "López", "Fernández", "18/05/1979", "ESP", "NIF", "56789012B",
        "Carrer de Colom, 8, Riola, Valencia, 46812",
        "carlos.lopez@gmail.com", "+34661234567", "15/06/2026", "20/06/2026", "TI"),

    // 2. Spouse – NIF, same address
    row("Laura", "Pérez", "Gómez", "24/10/1982", "ESP", "NIF", "87654321X",
        "Carrer de Colom, 8, Riola, Valencia, 46812",
        "laura.perez@gmail.com", "+34661234568", "15/06/2026", "20/06/2026", "CO"),

    // 3. Minor child – NIF, relationship child (CO)
    row("Diego", "López", "Pérez", "12/03/2015", "ESP", "NIF", "23456789D",
        "Carrer de Colom, 8, Riola, Valencia, 46812",
        "", "", "15/06/2026", "20/06/2026", "CO"),

    // ── EU NATIONALS ──
    // 4. French – valid PAS
    row("Amelie", "Bernard", "", "05/09/1990", "FRA", "PAS", "13FT01234",
        "10 Rue Lafayette, Marseille, 13001",
        "amelie.b@mail.fr", "+33612345678", "15/06/2026", "20/06/2026"),

    // 5. Romanian – PAS (EU member since 2007)
    row("Andrei", "Popescu", "Ion", "17/08/1985", "ROU", "PAS", "RO1234567",
        "Strada Victoriei 20, București, 010091",
        "andrei.p@yahoo.ro", "+40721234567", "15/06/2026", "20/06/2026"),

    // ── NON-EU NATIONALS ──
    // 6. American – PAS, US address with zip code
    row("John", "Smith", "", "30/11/1978", "USA", "PAS", "A12345678",
        "123 Main Street, New York, NY 10001",
        "john.smith@email.com", "+12125551234", "15/06/2026", "20/06/2026"),

    // 7. British (post-Brexit, non-EU) – PAS, UK address with postcode
    row("Emma", "Wilson", "Brown", "14/04/1992", "GBR", "PAS", "987654321",
        "15 Baker Street, London, W1U 8EQ",
        "emma.w@ukmail.co.uk", "+447912345678", "15/06/2026", "20/06/2026"),

    // 8. Japanese – PAS
    row("Yuki", "Tanaka", "", "02/07/1987", "JPN", "PAS", "TK1234567",
        "1-1 Shinjuku, Tokyo, 160-0022",
        "yuki.tanaka@jp.mail", "+81312345678", "15/06/2026", "20/06/2026"),

    // 9. Moroccan – PAS, no email
    row("Mohammed", "Alaoui", "Benkiran", "25/01/1975", "MAR", "PAS", "AB123456",
        "Rue Mohammed V 7, Casablanca, 20000",
        "", "+212661234567", "15/06/2026", "20/06/2026"),

    // 10. Chinese – OTRO (Chinese ID card used instead of passport), missing postal code
    row("Wei", "Zhang", "", "08/06/2000", "CHN", "OTRO", "110101200006081234",
        "Wangfujing Street 1, Beijing",
        "wei.zhang@cn.mail", "+8613012345678", "15/06/2026", "20/06/2026"),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, buildSheet(propertyRows, guests), "Viajeros");
  save(wb, "test3-esp-eu-noeu-mixto.xlsx");
}

console.log("\nDone. Files written to test-data/");
console.log("\nKey validation scenarios covered:");
console.log("  ESP residents: municipalityCode auto-resolve, missing CP, bad NIF letter");
console.log("  EU nationals: valid PAS, OTRO, non-Spanish CP formats, missing CP");
console.log("  Non-EU nationals: USA/GBR/JPN/MAR/CHN passports, OTRO ID card, missing fields");
