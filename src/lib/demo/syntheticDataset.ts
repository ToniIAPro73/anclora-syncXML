import type { ParsedExcel } from "@/lib/domain";

/**
 * Fully synthetic dataset for the controlled-validation demo.
 *
 * It hydrates the exact `ParsedExcel` shape produced by the Excel parser so the
 * existing workflow (validation, duplicate detection, XML preview) runs without
 * uploading any file and without touching the Excel-parsing logic.
 *
 * STRICTLY synthetic: invented names, example.com emails, fake documents and
 * generic addresses. It deliberately includes at least one operational error,
 * one pending field and one possible duplicate so the demo is meaningful.
 *
 * The validation status is left PENDING so `smartValidateParsedExcel` recomputes
 * issues from scratch, exactly as it would after a real upload.
 */
export function buildSyntheticParsedExcel(): ParsedExcel {
  return {
    fileName: "demo-datos-sinteticos.xlsx",
    sheets: ["Reservas demo"],
    reservation: {
      reference: "DEMO-2026-0001",
      channel: "Directo",
      checkInDate: "2026-07-12",
      checkInTime: "16:00",
      checkOutDate: "2026-07-15",
      checkOutTime: "11:00",
      contractDate: "2026-06-30",
      guestCount: 3,
      roomCount: 1,
      internet: true,
    },
    property: {
      name: "Alojamiento de Demostración",
      establishmentCode: "0000000000",
      address: "Calle Ejemplo 123",
      municipality: "Madrid",
      municipalityCode: "28079",
      postalCode: "28013",
      province: "Madrid",
      countryIso3: "ESP",
    },
    payment: {
      paymentType: "Tarjeta",
      paymentMethod: "TARJ",
      paymentHolder: "Ana Demo Ejemplo",
      iban: "ES00 0000 0000 0000 0000 0000",
    },
    guests: [
      // Complete, valid guest.
      makeGuest({
        sourceRow: 2,
        firstName: "Ana",
        surname1: "Demo",
        surname2: "Ejemplo",
        birthDate: "1990-04-18",
        nationalityIso3: "ESP",
        documentType: "NIF",
        documentNumber: "00000000T",
        sex: "M",
        address: "Calle Ejemplo 123",
        municipality: "Madrid",
        municipalityCode: "28079",
        postalCode: "28013",
        countryIso3: "ESP",
        phone: "600000001",
        email: "ana.demo@example.com",
        relationship: "TI",
        arrivalDate: "2026-07-12",
        departureDate: "2026-07-15",
      }),
      // Guest with a PENDING field: missing document number.
      makeGuest({
        sourceRow: 3,
        firstName: "Bruno",
        surname1: "Prueba",
        surname2: "Sintetico",
        birthDate: "1988-11-02",
        nationalityIso3: "ITA",
        documentType: "PAS",
        documentNumber: "",
        sex: "H",
        address: "Via Esempio 4",
        municipality: "Madrid",
        municipalityCode: "28079",
        postalCode: "28013",
        countryIso3: "ITA",
        phone: "600000002",
        email: "bruno.prueba@example.com",
        relationship: "AC",
        arrivalDate: "2026-07-12",
        departureDate: "2026-07-15",
      }),
      // Guest with an operational ERROR: invalid birth date format.
      makeGuest({
        sourceRow: 4,
        firstName: "Carla",
        surname1: "Ficticia",
        birthDate: "32/13/1995",
        nationalityIso3: "FRA",
        documentType: "PAS",
        documentNumber: "X1234567",
        sex: "M",
        address: "Rue Exemple 9",
        municipality: "Madrid",
        municipalityCode: "28079",
        postalCode: "28013",
        countryIso3: "FRA",
        phone: "600000003",
        email: "carla.ficticia@example.com",
        relationship: "AC",
        arrivalDate: "2026-07-12",
        departureDate: "2026-07-15",
      }),
      // POSSIBLE DUPLICATE of row 2 (same name + document).
      makeGuest({
        sourceRow: 5,
        firstName: "Ana",
        surname1: "Demo",
        surname2: "Ejemplo",
        birthDate: "1990-04-18",
        nationalityIso3: "ESP",
        documentType: "NIF",
        documentNumber: "00000000T",
        sex: "M",
        address: "Calle Ejemplo 123",
        municipality: "Madrid",
        municipalityCode: "28079",
        postalCode: "28013",
        countryIso3: "ESP",
        phone: "600000001",
        email: "ana.demo@example.com",
        relationship: "TI",
        arrivalDate: "2026-07-12",
        departureDate: "2026-07-15",
      }),
    ],
    ignoredRows: [],
    rawRows: [],
    validation: { status: "PENDING", errors: [], warnings: [] },
  };
}

type GuestSeed = {
  sourceRow: number;
  firstName: string;
  surname1: string;
  surname2?: string;
  birthDate?: string;
  nationalityIso3?: string;
  documentType?: "NIF" | "NIE" | "PAS" | "OTRO";
  documentNumber?: string;
  sex?: "H" | "M" | "O";
  address?: string;
  municipality?: string;
  municipalityCode?: string;
  postalCode?: string;
  countryIso3?: string;
  phone?: string;
  email?: string;
  relationship?: string;
  arrivalDate?: string;
  departureDate?: string;
};

function makeGuest(seed: GuestSeed): ParsedExcel["guests"][number] {
  return {
    role: "VI",
    validationStatus: "PENDING",
    errors: [],
    warnings: [],
    ...seed,
  };
}
