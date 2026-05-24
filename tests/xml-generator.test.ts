import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseExcelBuffer } from "@/lib/excel/parseExcel";
import { generateHospitalityXml } from "@/lib/xml/generateHospitalityXml";
import { validateGuest } from "@/lib/validation";

describe("generateHospitalityXml", () => {
  const parsed = (() => {
    const imported = parseExcelBuffer(readFileSync("docs/registro_huespedes.xlsx"));
    const guests = imported.guests.map((guest) => validateGuest({
      ...guest,
      municipalityCode: "07040",
      documentSupport: "123456789",
    }));
    return {
      ...imported,
      guests,
      validation: { status: "VALID" as const, errors: [], warnings: [] },
    };
  })();
  const template = readFileSync("docs/xml-plantilla.xml", "utf8");
  const generated = generateHospitalityXml(parsed, template);

  it("generates a new XML per reservation without template person placeholders", () => {
    expect(generated.xml).toContain("5992657522");
    expect(generated.xml).toContain("<codigoEstablecimiento>0000044116</codigoEstablecimiento>");
    expect(generated.xml).toContain("<numPersonas>7</numPersonas>");
    expect(generated.xml.match(/<persona>/g)).toHaveLength(7);
    expect(generated.xml).not.toContain("correo@correo.es");
    expect(generated.xml).not.toContain("<numeroDocumento>00000000T</numeroDocumento>");
    expect(generated.validation.errors.filter((error) => error.code === "xml.placeholder.critical")).toHaveLength(0);
  });

  it("keeps the namespace and dates", () => {
    expect(generated.xml).toContain("http://www.neg.hospedajes.mir.es/altaParteHospedaje");
    expect(generated.xml).toContain("2026-04-30T12:00:00+02:00");
    expect(generated.xml).toContain("2026-05-03T10:00:00+02:00");
  });

  it("uses Europe/Madrid winter offset instead of a fixed +02:00", () => {
    const winter = generateHospitalityXml({
      ...parsed,
      reservation: {
        ...parsed.reservation,
        checkInDate: "2026-01-10",
        checkOutDate: "2026-01-12",
      },
    }, template);

    expect(winter.xml).toContain("2026-01-10T12:00:00+01:00");
    expect(winter.xml).toContain("2026-01-12T10:00:00+01:00");
  });

  it("does not flag a legitimate 2026-04-09 reservation date as a template placeholder", () => {
    const sameAsTemplateDate = generateHospitalityXml({
      ...parsed,
      reservation: {
        ...parsed.reservation,
        checkInDate: "2026-04-09",
        checkOutDate: "2026-04-10",
      },
    }, template);

    expect(sameAsTemplateDate.validation.errors.filter((error) => error.code === "xml.placeholder.critical")).toHaveLength(0);
  });
});
