import { describe, expect, it, vi, afterEach } from "vitest";
import { getSesConfig } from "@/lib/ses/config";
import { buildComunicacionEnvelope, sendParteHospedajeXml } from "@/lib/ses/client";
import { validateSesHospedajesXml } from "@/lib/ses/schema";
import { zipXmlBase64 } from "@/lib/ses/zip";

const OLD_ENV = { ...process.env };

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...OLD_ENV };
});

const validParteHospedajeXml = `<?xml version="1.0" encoding="UTF-8"?>
<ns2:peticion xmlns:ns2="http://www.neg.hospedajes.mir.es/altaParteHospedaje">
  <solicitud>
    <codigoEstablecimiento>0000044116</codigoEstablecimiento>
    <comunicacion>
      <contrato>
        <referencia>5992657522</referencia>
        <fechaContrato>2026-04-09+02:00</fechaContrato>
        <fechaEntrada>2026-04-30T12:00:00+02:00</fechaEntrada>
        <fechaSalida>2026-05-03T10:00:00+02:00</fechaSalida>
        <numPersonas>1</numPersonas>
        <numHabitaciones>1</numHabitaciones>
        <internet>true</internet>
        <pago>
          <tipoPago>PLATF</tipoPago>
        </pago>
      </contrato>
      <persona>
        <rol>VI</rol>
        <nombre>Ana</nombre>
        <apellido1>Garcia</apellido1>
        <tipoDocumento>NIF</tipoDocumento>
        <numeroDocumento>12345678Z</numeroDocumento>
        <fechaNacimiento>1990-01-01+01:00</fechaNacimiento>
        <nacionalidad>ESP</nacionalidad>
        <direccion>
          <direccion>Calle Mayor 1</direccion>
          <codigoMunicipio>07040</codigoMunicipio>
          <codigoPostal>07001</codigoPostal>
          <pais>ESP</pais>
        </direccion>
      </persona>
    </comunicacion>
  </solicitud>
</ns2:peticion>`;

describe("SES.HOSPEDAJES phase 3 integration", () => {
  it("validates altaParteHospedaje XML against the local official-schema rules", () => {
    const validation = validateSesHospedajesXml(validParteHospedajeXml);
    expect(validation.ok).toBe(true);
    expect(validation.schemaVersion).toBe("v3.1.3");
  });

  it("rejects XML that is well formed but violates required SES fields", () => {
    const validation = validateSesHospedajesXml(validParteHospedajeXml.replace("<codigoPostal>07001</codigoPostal>", ""));
    expect(validation.ok).toBe(false);
    expect(validation.errors.some((error) => error.field?.endsWith("direccion.codigoPostal"))).toBe(true);
  });

  it("packages the XML as a ZIP container encoded in Base64", () => {
    const encoded = zipXmlBase64(validParteHospedajeXml);
    expect(encoded).toMatch(/^UEsDB/);
    expect(Buffer.from(encoded, "base64").readUInt32LE(0)).toBe(0x04034b50);
  });

  it("builds SOAP communication envelopes for the documented PV alta operation", () => {
    const config = {
      ...getSesConfig("pre"),
      username: "user",
      password: "pass",
      landlordCode: "ARREN123",
      applicationName: "Anclora SyncXML",
    };
    const soap = buildComunicacionEnvelope({
      config,
      operation: "A",
      communicationType: "PV",
      zippedXmlBase64: zipXmlBase64(validParteHospedajeXml),
    });

    expect(soap).toContain("<com:comunicacionRequest>");
    expect(soap).toContain("<codigoArrendador>ARREN123</codigoArrendador>");
    expect(soap).toContain("<tipoOperacion>A</tipoOperacion>");
    expect(soap).toContain("<tipoComunicacion>PV</tipoComunicacion>");
  });

  it("blocks production sending unless explicitly enabled", async () => {
    vi.stubEnv("SYNCXML_SES_USERNAME", "user");
    vi.stubEnv("SYNCXML_SES_PASSWORD", "pass");
    vi.stubEnv("SYNCXML_SES_LANDLORD_CODE", "ARREN123");
    vi.stubEnv("SYNCXML_SES_APPLICATION", "Anclora SyncXML");
    vi.stubEnv("SYNCXML_SES_ALLOW_PRODUCTION_SEND", "false");

    await expect(sendParteHospedajeXml(validParteHospedajeXml, { environment: "prod", dryRun: false })).rejects.toThrow(/production sending is blocked/);
  });
});
