import { z } from "zod";

const validationStatusSchema = z.enum(["PENDING", "VALID", "WARNING", "ERROR"]);

const validationIssueSchema = z.object({
  severity: z.enum(["error", "warning", "info"]),
  code: z.string(),
  message: z.string(),
  recommendation: z.string().optional(),
  field: z.string().optional(),
  sourceRow: z.number().int().positive().optional(),
});

const guestSchema = z.object({
  sourceRow: z.number().int().positive(),
  role: z.literal("VI"),
  firstName: z.string(),
  surname1: z.string(),
  surname2: z.string().optional(),
  birthDate: z.string().optional(),
  nationalityIso3: z.string().optional(),
  documentType: z.enum(["NIF", "NIE", "PAS", "OTRO"]).optional(),
  documentNumber: z.string().optional(),
  documentSupport: z.string().optional(),
  sex: z.enum(["H", "M", "O"]).optional(),
  address: z.string().optional(),
  addressComplement: z.string().optional(),
  municipality: z.string().optional(),
  municipalityCode: z.string().optional(),
  postalCode: z.string().optional(),
  countryIso3: z.string().optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),
  relationship: z.string().optional(),
  arrivalDate: z.string().optional(),
  departureDate: z.string().optional(),
  validationStatus: validationStatusSchema,
  errors: z.array(validationIssueSchema),
  warnings: z.array(validationIssueSchema),
});

const parsedExcelSchema = z.object({
  fileName: z.string().optional(),
  sheets: z.array(z.string()),
  reservation: z.object({
    reference: z.string().optional(),
    channel: z.string().optional(),
    checkInDate: z.string().optional(),
    checkInTime: z.string().optional(),
    checkOutDate: z.string().optional(),
    checkOutTime: z.string().optional(),
    contractDate: z.string().optional(),
    guestCount: z.number().int().nonnegative().optional(),
    roomCount: z.number().int().nonnegative().optional(),
    internet: z.boolean().optional(),
  }),
  property: z.object({
    name: z.string().optional(),
    establishmentCode: z.string().optional(),
    address: z.string().optional(),
    municipality: z.string().optional(),
    municipalityCode: z.string().optional(),
    postalCode: z.string().optional(),
    province: z.string().optional(),
    countryIso3: z.string().optional(),
  }),
  payment: z.object({
    paymentType: z.string().optional(),
    paymentMethod: z.string().optional(),
    paymentHolder: z.string().optional(),
    iban: z.string().optional(),
  }),
  guests: z.array(guestSchema),
  ignoredRows: z.array(z.object({
    rowNumber: z.number().int().positive(),
    values: z.array(z.string()),
    reason: z.string(),
  })),
  rawRows: z.array(z.object({
    rowNumber: z.number().int().positive(),
    values: z.array(z.string()),
  })),
  duplicates: z.array(z.object({
    id: z.string(),
    classification: z.enum(["likely", "possible", "none"]),
    reasonCodes: z.array(z.string()),
    sourceRows: z.array(z.number().int().positive()),
    resolution: z.enum(["pending", "skip_new", "keep_both", "manual_review"]),
  })).optional(),
  validation: z.object({
    status: validationStatusSchema,
    errors: z.array(validationIssueSchema),
    warnings: z.array(validationIssueSchema),
  }),
});

export const generateXmlPayloadSchema = z.object({
  parsed: parsedExcelSchema,
});

export const reservationPayloadSchema = z.object({
  parsed: parsedExcelSchema,
  generated: z.object({
    xml: z.string().optional(),
    status: z.string().optional(),
  }).passthrough().optional(),
});
