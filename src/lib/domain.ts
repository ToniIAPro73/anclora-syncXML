export type AppTheme = "dark" | "light" | "system";
export type AppLanguage = "es" | "en" | "de";
export type ValidationSeverity = "error" | "warning" | "info";
export type ValidationStatus = "PENDING" | "VALID" | "WARNING" | "ERROR";
export type ReservationStatus = "DRAFT" | "IMPORTED" | "VALIDATED" | "XML_GENERATED" | "CONSOLIDATED" | "DOWNLOADED" | "DELETED";

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  message: string;
  recommendation?: string;
  field?: string;
  sourceRow?: number;
};

export type GuestRecord = {
  sourceRow: number;
  role: "VI";
  firstName: string;
  surname1: string;
  surname2?: string;
  birthDate?: string;
  nationalityIso3?: string;
  documentType?: "NIF" | "NIE" | "PAS" | "OTRO";
  documentNumber?: string;
  documentSupport?: string;
  sex?: "H" | "M" | "O";
  address?: string;
  addressComplement?: string;
  municipality?: string;
  municipalityCode?: string;
  postalCode?: string;
  countryIso3?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  relationship?: string;
  arrivalDate?: string;
  departureDate?: string;
  validationStatus: ValidationStatus;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

export type PropertyData = {
  name?: string;
  establishmentCode?: string;
  address?: string;
  municipality?: string;
  municipalityCode?: string;
  postalCode?: string;
  province?: string;
  countryIso3?: string;
};

export type ReservationData = {
  reference?: string;
  channel?: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  contractDate?: string;
  guestCount?: number;
  roomCount?: number;
  internet?: boolean;
};

export type PaymentData = {
  paymentType?: string;
  paymentMethod?: string;
  paymentHolder?: string;
  iban?: string;
};

export type DuplicateClassification = "likely" | "possible" | "none";
export type DuplicateResolution = "pending" | "skip_new" | "keep_both" | "manual_review";

export type DuplicateCandidate = {
  id: string;
  classification: DuplicateClassification;
  reasonCodes: string[];
  sourceRows: number[];
  resolution: DuplicateResolution;
};

export type ParsedExcel = {
  fileName?: string;
  sheets: string[];
  reservation: ReservationData;
  property: PropertyData;
  payment: PaymentData;
  guests: GuestRecord[];
  ignoredRows: Array<{ rowNumber: number; values: string[]; reason: string }>;
  rawRows: Array<{ rowNumber: number; values: string[] }>;
  duplicates?: DuplicateCandidate[];
  validation: {
    status: ValidationStatus;
    errors: ValidationIssue[];
    warnings: ValidationIssue[];
  };
};

export type GeneratedXmlResult = {
  xml: string;
  visual: {
    reservation: ReservationData;
    property: PropertyData;
    payment: PaymentData;
    guests: GuestRecord[];
  };
  validation: ParsedExcel["validation"];
};
