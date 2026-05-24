import { describe, expect, it } from "vitest";
import type { MunicipioCatalogRecord } from "@/lib/municipios/resolveMunicipio";
import { normalizeMunicipioName, provinceCodeFromPostalCode } from "@/lib/municipios/normalize";
import { resolveMunicipioForGuest, resolveParsedMunicipiosFromDb } from "@/lib/municipios/resolveMunicipio";
import { normalizeIneMunicipio, syncIneMunicipios } from "@/lib/ine/municipios";
import type { ParsedExcel } from "@/lib/domain";

const catalog: MunicipioCatalogRecord[] = [
  { codigoMunicipio: "46248", codigoProvincia: "46", codigoMunicipioCorto: "248", nombre: "Polinyà de Xúquer", nombreNormalizado: normalizeMunicipioName("Polinyà de Xúquer") },
  { codigoMunicipio: "46215", codigoProvincia: "46", codigoMunicipioCorto: "215", nombre: "Riola", nombreNormalizado: normalizeMunicipioName("Riola") },
  { codigoMunicipio: "46250", codigoProvincia: "46", codigoMunicipioCorto: "250", nombre: "València", nombreNormalizado: normalizeMunicipioName("València") },
  { codigoMunicipio: "07040", codigoProvincia: "07", codigoMunicipioCorto: "040", nombre: "Palma", nombreNormalizado: normalizeMunicipioName("Palma") },
  { codigoMunicipio: "28079", codigoProvincia: "28", codigoMunicipioCorto: "079", nombre: "Madrid", nombreNormalizado: normalizeMunicipioName("Madrid") },
];

describe("municipio normalisation", () => {
  it("removes accents, lowercases and cleans whitespace", () => {
    expect(normalizeMunicipioName("  Polinyà   Del   Xúquer ")).toBe("polinya de xuquer");
    expect(normalizeMunicipioName("València")).toBe("valencia");
    expect(normalizeMunicipioName("Palma de Mallorca")).toBe("palma de mallorca");
  });

  it("derives province codes from Spanish postal codes", () => {
    expect(provinceCodeFromPostalCode("46417")).toBe("46");
    expect(provinceCodeFromPostalCode("07015")).toBe("07");
    expect(provinceCodeFromPostalCode("28013")).toBe("28");
    expect(provinceCodeFromPostalCode("99999")).toBe(null);
  });
});

describe("municipio resolution", () => {
  it("resolves by postal code and exact municipality", () => {
    const result = resolveMunicipioForGuest({ postalCode: "46417", municipality: "Riola", countryIso3: "ESP" }, catalog);
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") expect(result.municipio.codigoMunicipio).toBe("46215");
  });

  it("resolves by postal code and municipality with different accents", () => {
    const result = resolveMunicipioForGuest({ postalCode: "46417", municipality: "Polinya Del Xuquer", countryIso3: "ESP" }, catalog);
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") expect(result.municipio.codigoMunicipio).toBe("46248");
  });

  it("resolves from address text when there is one clear candidate", () => {
    const result = resolveMunicipioForGuest({ postalCode: "46417", address: "C/ Ample 24, Riola, Valencia", countryIso3: "ESP" }, catalog);
    expect(result.status).toBe("resolved");
    if (result.status === "resolved") expect(result.municipio.codigoMunicipio).toBe("46215");
  });

  it("does not resolve invalid postal codes", () => {
    const result = resolveMunicipioForGuest({ postalCode: "ABCDE", municipality: "Riola", countryIso3: "ESP" }, catalog);
    expect(result.status).toBe("not_found");
  });

  it("does not choose randomly when several candidates appear", () => {
    const result = resolveMunicipioForGuest({ postalCode: "46417", address: "Polinya de Xuquer y Riola", countryIso3: "ESP" }, catalog);
    expect(result.status).toBe("ambiguous");
  });

  it("returns not found without a candidate", () => {
    const result = resolveMunicipioForGuest({ postalCode: "46417", municipality: "No existe", countryIso3: "ESP" }, catalog);
    expect(result.status).toBe("not_found");
  });

  it("does not block parsing when the municipality catalog is unavailable", async () => {
    const parsed: ParsedExcel = {
      fileName: "test.xlsx",
      sheets: ["Sheet1"],
      reservation: { reference: "R1", checkInDate: "2026-05-01", checkOutDate: "2026-05-03", guestCount: 1 },
      property: { establishmentCode: "0001", countryIso3: "ESP" },
      payment: { paymentType: "PLATF" },
      guests: [{
        sourceRow: 2,
        role: "VI",
        firstName: "Ana",
        surname1: "Garcia",
        birthDate: "1990-01-01",
        nationalityIso3: "ESP",
        documentType: "NIF",
        documentNumber: "12345678Z",
        postalCode: "46417",
        countryIso3: "ESP",
        validationStatus: "WARNING",
        errors: [],
        warnings: [],
      }],
      ignoredRows: [],
      rawRows: [],
      validation: { status: "VALID", errors: [], warnings: [] },
    };

    const resolved = await resolveParsedMunicipiosFromDb(parsed, {
      async findByProvince() {
        throw new Error("relation does not exist");
      },
    });

    expect(resolved.guests).toHaveLength(1);
    expect(resolved.validation.errors.some((error) => error.code === "guest.municipalityCode.required")).toBe(true);
  });
});

describe("INE municipios sync", () => {
  it("normalizes INE raw records", () => {
    expect(normalizeIneMunicipio({ Id: 1, FK_Variable: 19, Nombre: "València", Codigo: "46250" })).toMatchObject({
      codigoMunicipio: "46250",
      codigoProvincia: "46",
      codigoMunicipioCorto: "250",
      nombreNormalizado: "valencia",
    });
  });

  it("paginates, upserts and reports the summary", async () => {
    const calls: number[] = [];
    const existing = new Set(["46250"]);
    const summary = await syncIneMunicipios({
      fetchPage: async (page) => {
        calls.push(page);
        if (page === 1) return [
          { Id: 1, FK_Variable: 19, Nombre: "València", Codigo: "46250" },
          { Id: 2, FK_Variable: 19, Nombre: "Riola", Codigo: "46215" },
        ];
        if (page === 2) return [{ Id: 3, FK_Variable: 19, Nombre: "Polinyà de Xúquer", Codigo: "46248" }];
        return [];
      },
      repository: {
        async upsertMunicipio(record) {
          if (record.codigoMunicipio === "46215") return "updated";
          if (existing.has(record.codigoMunicipio)) return "skipped";
          existing.add(record.codigoMunicipio);
          return "inserted";
        },
      },
    });

    expect(calls).toEqual([1, 2, 3]);
    expect(summary.totalFetched).toBe(3);
    expect(summary.inserted).toBe(1);
    expect(summary.updated).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(summary.errors).toHaveLength(0);
  });

  it("reports partial INE errors without throwing away the summary", async () => {
    const summary = await syncIneMunicipios({
      fetchPage: async (page) => {
        if (page === 1) return [{ Id: 1, FK_Variable: 19, Nombre: "Riola", Codigo: "46215" }];
        throw new Error("Timeout consultando INE");
      },
      repository: {
        async upsertMunicipio() {
          return "inserted";
        },
      },
    });

    expect(summary.ok).toBe(false);
    expect(summary.totalFetched).toBe(1);
    expect(summary.inserted).toBe(1);
    expect(summary.errors[0]).toMatchObject({ page: 2, reason: "Timeout consultando INE" });
  });
});
