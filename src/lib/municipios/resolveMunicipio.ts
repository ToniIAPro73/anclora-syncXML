import type { GuestRecord, ParsedExcel, ValidationIssue } from "@/lib/domain";
import { municipioNameVariants, normalizeMunicipioName, provinceCodeFromPostalCode } from "./normalize";
import { smartValidateParsedExcel, validateGuest } from "@/lib/validation";

export type MunicipioCatalogRecord = {
  codigoMunicipio: string;
  codigoProvincia: string;
  codigoMunicipioCorto?: string;
  nombre: string;
  nombreNormalizado: string;
};

export type MunicipioResolution =
  | { status: "resolved"; municipio: MunicipioCatalogRecord; reason: "postal_code_name" | "postal_code_address" }
  | { status: "ambiguous"; candidates: MunicipioCatalogRecord[] }
  | { status: "not_found"; candidates: MunicipioCatalogRecord[] };

export type MunicipioLookupRepository = {
  findByProvince(codigoProvincia: string): Promise<MunicipioCatalogRecord[]>;
};

export function resolveMunicipioForGuest(guest: Pick<GuestRecord, "postalCode" | "municipality" | "address" | "countryIso3">, candidates: MunicipioCatalogRecord[]): MunicipioResolution {
  if (guest.countryIso3 && guest.countryIso3 !== "ESP") return { status: "not_found", candidates: [] };
  const province = provinceCodeFromPostalCode(guest.postalCode);
  if (!province) return { status: "not_found", candidates: [] };
  const provinceCandidates = candidates.filter((candidate) => candidate.codigoProvincia === province);
  if (!provinceCandidates.length) return { status: "not_found", candidates: [] };

  const explicitText = normalizeMunicipioName(guest.municipality);
  const addressText = normalizeMunicipioName(guest.address);
  const explicitMatches = matchMunicipios(explicitText, provinceCandidates);
  if (explicitMatches.length === 1) return { status: "resolved", municipio: explicitMatches[0], reason: "postal_code_name" };
  if (explicitMatches.length > 1) return { status: "ambiguous", candidates: explicitMatches };

  const addressMatches = matchMunicipiosInAddress(guest.address, addressText, provinceCandidates);
  if (addressMatches.length === 1) return { status: "resolved", municipio: addressMatches[0], reason: "postal_code_address" };
  if (addressMatches.length > 1) return { status: "ambiguous", candidates: addressMatches };

  return { status: "not_found", candidates: provinceCandidates };
}

export async function resolveParsedMunicipiosFromDb(parsed: ParsedExcel, repository: MunicipioLookupRepository): Promise<ParsedExcel> {
  const provinces = Array.from(new Set(parsed.guests.map((guest) => provinceCodeFromPostalCode(guest.postalCode)).filter((province): province is string => Boolean(province))));
  const byProvince = new Map<string, MunicipioCatalogRecord[]>();
  await Promise.all(provinces.map(async (province) => {
    try {
      byProvince.set(province, await repository.findByProvince(province));
    } catch {
      byProvince.set(province, []);
    }
  }));

  const guests = parsed.guests.map((guest) => {
    if (guest.municipalityCode || guest.countryIso3 !== "ESP") return guest;
    const province = provinceCodeFromPostalCode(guest.postalCode);
    if (!province) return guest;
    const resolution = resolveMunicipioForGuest(guest, byProvince.get(province) ?? []);
    if (resolution.status !== "resolved") return guest;
    const editable = toEditableGuest(guest);
    const resolved = validateGuest({ ...editable, municipalityCode: resolution.municipio.codigoMunicipio, municipality: guest.municipality || resolution.municipio.nombre });
    return {
      ...resolved,
      warnings: [
        ...resolved.warnings.filter((warning) => warning.code !== "guest.municipalityCode.missing"),
        infoIssue("municipality.autoResolved", "Código municipio resuelto automáticamente por CP + municipio.", "municipalityCode", guest.sourceRow),
      ],
      validationStatus: resolved.errors.length ? "ERROR" : "WARNING",
    } satisfies GuestRecord;
  });

  return smartValidateParsedExcel({ ...parsed, guests });
}

function matchMunicipios(text: string, candidates: MunicipioCatalogRecord[]) {
  if (!text) return [];
  return candidates.filter((candidate) => {
    const variants = municipioNameVariants(candidate.nombreNormalizado || candidate.nombre);
    return variants.some((variant) => variant && (text === variant || text.includes(variant) || variant.includes(text)));
  });
}

function matchMunicipiosInAddress(rawAddress: string | undefined, normalizedAddress: string, candidates: MunicipioCatalogRecord[]) {
  const matches = matchMunicipios(normalizedAddress, candidates);
  if (matches.length <= 1) return matches;
  const segments = (rawAddress ?? "")
    .split(",")
    .map((segment) => normalizeMunicipioName(segment))
    .filter((segment) => segment && !/^\d{5}$/.test(segment));
  if (segments.length < 2) return matches;
  const lastIndex = segments.length - 1;
  const indexedMatches = matches.map((candidate) => {
    const variants = municipioNameVariants(candidate.nombreNormalizado || candidate.nombre);
    const indexes = segments
      .map((segment, index) => variants.some((variant) => segment === variant || segment.includes(variant)) ? index : -1)
      .filter((index) => index >= 0);
    return { candidate, indexes };
  });
  const hasEarlierMatch = indexedMatches.some((item) => item.indexes.some((index) => index < lastIndex));
  if (!hasEarlierMatch) return matches;
  const filtered = indexedMatches
    .filter((item) => item.indexes.some((index) => index < lastIndex))
    .map((item) => item.candidate);
  return filtered.length ? filtered : matches;
}

function infoIssue(code: string, message: string, field: string, sourceRow?: number): ValidationIssue {
  return { severity: "info", code, message, field, sourceRow };
}

function toEditableGuest(guest: GuestRecord): Omit<GuestRecord, "validationStatus" | "errors" | "warnings"> {
  return {
    sourceRow: guest.sourceRow,
    role: guest.role,
    firstName: guest.firstName,
    surname1: guest.surname1,
    surname2: guest.surname2,
    birthDate: guest.birthDate,
    nationalityIso3: guest.nationalityIso3,
    documentType: guest.documentType,
    documentNumber: guest.documentNumber,
    documentSupport: guest.documentSupport,
    sex: guest.sex,
    address: guest.address,
    addressComplement: guest.addressComplement,
    municipality: guest.municipality,
    municipalityCode: guest.municipalityCode,
    postalCode: guest.postalCode,
    countryIso3: guest.countryIso3,
    phone: guest.phone,
    phone2: guest.phone2,
    email: guest.email,
    relationship: guest.relationship,
    arrivalDate: guest.arrivalDate,
    departureDate: guest.departureDate,
  };
}
