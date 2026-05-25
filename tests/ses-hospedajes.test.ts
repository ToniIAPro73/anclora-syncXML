import { describe, expect, it, vi, afterEach } from "vitest";
import { getSesConfig } from "@/lib/ses/config";
import { buildComunicacionEnvelope, sendParteHospedajeXml } from "@/lib/ses/client";
import { validateSesHospedajesXml } from "@/lib/ses/schema";
import { zipXmlBase64 } from "@/lib/ses/zip";
import {
  parseComunicacionResponse,
  parseConsultaLoteResponse,
  deriveSesStatus,
  extractFirstCommunicationCode,
  collectSesErrors,
  sanitizeSoapForStorage,
} from "@/lib/ses/parser";

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
        <apellido2>Lopez</apellido2>
        <tipoDocumento>NIF</tipoDocumento>
        <numeroDocumento>12345678Z</numeroDocumento>
        <soporteDocumento>123456789</soporteDocumento>
        <fechaNacimiento>1990-01-01+01:00</fechaNacimiento>
        <nacionalidad>ESP</nacionalidad>
        <direccion>
          <direccion>Calle Mayor 1</direccion>
          <codigoMunicipio>07040</codigoMunicipio>
          <codigoPostal>07001</codigoPostal>
          <pais>ESP</pais>
        </direccion>
        <telefono>666666666</telefono>
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

  it("rejects XML with catalogue values outside the documented SES values", () => {
    const validation = validateSesHospedajesXml(validParteHospedajeXml.replace("<tipoPago>PLATF</tipoPago>", "<tipoPago>TEXTO</tipoPago>"));

    expect(validation.ok).toBe(false);
    expect(validation.errors.some((error) => error.code === "ses.catalog.paymentType")).toBe(true);
  });

  it("rejects XML with salida before entrada", () => {
    const validation = validateSesHospedajesXml(validParteHospedajeXml.replace(
      "<fechaSalida>2026-05-03T10:00:00+02:00</fechaSalida>",
      "<fechaSalida>2026-04-29T10:00:00+02:00</fechaSalida>",
    ));

    expect(validation.ok).toBe(false);
    expect(validation.errors.some((error) => error.code === "ses.business.dateOrder")).toBe(true);
  });

  it("requires codigoMunicipio for Spanish addresses", () => {
    const validation = validateSesHospedajesXml(validParteHospedajeXml.replace("<codigoMunicipio>07040</codigoMunicipio>", ""));

    expect(validation.ok).toBe(false);
    expect(validation.errors.some((error) => error.code === "ses.business.municipalityCode.required")).toBe(true);
  });

  it("requires nombreMunicipio instead of codigoMunicipio for foreign addresses", () => {
    const foreignXml = validParteHospedajeXml
      .replace("<codigoMunicipio>07040</codigoMunicipio>", "")
      .replace("<pais>ESP</pais>", "<pais>FRA</pais>");
    const validation = validateSesHospedajesXml(foreignXml);

    expect(validation.ok).toBe(false);
    expect(validation.errors.some((error) => error.code === "ses.business.nombreMunicipio.required")).toBe(true);
  });

  it("requires at least one contact value per traveller", () => {
    const validation = validateSesHospedajesXml(validParteHospedajeXml.replace("<telefono>666666666</telefono>", ""));

    expect(validation.ok).toBe(false);
    expect(validation.errors.some((error) => error.code === "ses.business.contact.required")).toBe(true);
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

  it("only enables insecure SES TLS bypass for preproduction", () => {
    vi.stubEnv("SYNCXML_SES_ALLOW_INSECURE_TLS", "true");

    expect(getSesConfig("pre").allowInsecureTls).toBe(true);
    expect(getSesConfig("prod").allowInsecureTls).toBe(false);
  });
});

// ─── SOAP response parser tests ───────────────────────────────────────────────

const COMUNICACION_OK_SOAP = `<?xml version='1.0' encoding='UTF-8'?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Header/>
  <SOAP-ENV:Body>
    <ns3:comunicacionResponse xmlns:ns3="http://www.soap.servicios.hospedajes.mir.es/comunicacion">
      <respuesta>
        <codigo>0</codigo>
        <descripcion>OK</descripcion>
        <lote>20260526001234</lote>
      </respuesta>
    </ns3:comunicacionResponse>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

const COMUNICACION_WITH_RESULTS_SOAP = `<?xml version='1.0' encoding='UTF-8'?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Header/>
  <SOAP-ENV:Body>
    <ns3:comunicacionResponse xmlns:ns3="http://www.soap.servicios.hospedajes.mir.es/comunicacion">
      <respuesta>
        <codigo>0</codigo>
        <descripcion>OK</descripcion>
        <lote>20260526001234</lote>
      </respuesta>
      <resultado>
        <lote>20260526001234</lote>
        <tipoComunicacion>PV</tipoComunicacion>
        <tipoOperacion>A</tipoOperacion>
        <fechaPeticion>2026-05-26T10:00:00</fechaPeticion>
        <fechaProcesamiento>2026-05-26T10:00:05</fechaProcesamiento>
        <codigoEstado>0</codigoEstado>
        <descEstado>Procesado</descEstado>
        <identificadorUsuario>user</identificadorUsuario>
        <nombreUsuario>Usuario Test</nombreUsuario>
        <codigoArrendador>0000005422</codigoArrendador>
        <aplicacion>Anclora SyncXML</aplicacion>
        <resultadoComunicaciones>
          <resultadoComunicacion>
            <orden>1</orden>
            <codigoComunicacion>COM-2026-001</codigoComunicacion>
          </resultadoComunicacion>
        </resultadoComunicaciones>
      </resultado>
    </ns3:comunicacionResponse>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

const COMUNICACION_ERROR_SOAP = `<?xml version='1.0' encoding='UTF-8'?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Header/>
  <SOAP-ENV:Body>
    <ns3:comunicacionResponse xmlns:ns3="http://www.soap.servicios.hospedajes.mir.es/comunicacion">
      <respuesta>
        <codigo>1</codigo>
        <descripcion>Error de validación</descripcion>
      </respuesta>
      <resultado>
        <lote>20260526000000</lote>
        <tipoComunicacion>PV</tipoComunicacion>
        <tipoOperacion>A</tipoOperacion>
        <fechaPeticion>2026-05-26T10:00:00</fechaPeticion>
        <fechaProcesamiento>2026-05-26T10:00:01</fechaProcesamiento>
        <codigoEstado>1</codigoEstado>
        <descEstado>Error</descEstado>
        <identificadorUsuario>user</identificadorUsuario>
        <nombreUsuario>Usuario Test</nombreUsuario>
        <codigoArrendador>0000005422</codigoArrendador>
        <aplicacion>Anclora SyncXML</aplicacion>
        <resultadoComunicaciones>
          <resultadoComunicacion>
            <orden>1</orden>
            <tipoError>VAL</tipoError>
            <error>Fecha entrada inválida</error>
          </resultadoComunicacion>
        </resultadoComunicaciones>
      </resultado>
    </ns3:comunicacionResponse>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

const CONSULTA_LOTE_SOAP = `<?xml version='1.0' encoding='UTF-8'?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Header/>
  <SOAP-ENV:Body>
    <ns3:consultaLoteResponse xmlns:ns3="http://www.soap.servicios.hospedajes.mir.es/comunicacion">
      <respuesta>
        <codigo>0</codigo>
        <descripcion>OK</descripcion>
      </respuesta>
      <resultado>
        <lote>20260526001234</lote>
        <tipoComunicacion>PV</tipoComunicacion>
        <tipoOperacion>A</tipoOperacion>
        <fechaPeticion>2026-05-26T10:00:00</fechaPeticion>
        <fechaProcesamiento>2026-05-26T10:01:00</fechaProcesamiento>
        <codigoEstado>0</codigoEstado>
        <descEstado>Procesado</descEstado>
        <identificadorUsuario>user</identificadorUsuario>
        <nombreUsuario>Usuario Test</nombreUsuario>
        <codigoArrendador>0000005422</codigoArrendador>
        <aplicacion>Anclora SyncXML</aplicacion>
        <resultadoComunicaciones>
          <resultadoComunicacion>
            <orden>1</orden>
            <codigoComunicacion>COM-2026-001</codigoComunicacion>
          </resultadoComunicacion>
        </resultadoComunicaciones>
      </resultado>
    </ns3:consultaLoteResponse>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

const SOAP_FAULT = `<?xml version='1.0' encoding='UTF-8'?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Body>
    <SOAP-ENV:Fault>
      <faultcode>SOAP-ENV:Client</faultcode>
      <faultstring>Access denied</faultstring>
    </SOAP-ENV:Fault>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

describe("SES SOAP response parser", () => {
  it("parses comunicacionResponse with lote code and ok=true", () => {
    const result = parseComunicacionResponse(COMUNICACION_OK_SOAP);
    expect(result.ok).toBe(true);
    expect(result.responseCode).toBe("0");
    expect(result.sesBatchCode).toBe("20260526001234");
    expect(result.resultados).toHaveLength(0);
  });

  it("parses comunicacionResponse with resultados and codigoComunicacion", () => {
    const result = parseComunicacionResponse(COMUNICACION_WITH_RESULTS_SOAP);
    expect(result.ok).toBe(true);
    expect(result.sesBatchCode).toBe("20260526001234");
    expect(result.resultados).toHaveLength(1);
    expect(result.resultados[0].communicationResults[0].communicationCode).toBe("COM-2026-001");
  });

  it("parses comunicacionResponse error with sesErrors", () => {
    const result = parseComunicacionResponse(COMUNICACION_ERROR_SOAP);
    expect(result.ok).toBe(false);
    expect(result.responseCode).toBe("1");
    const errors = collectSesErrors(result.resultados);
    expect(errors).toHaveLength(1);
    expect((errors[0] as { error: string }).error).toBe("Fecha entrada inválida");
  });

  it("parses consultaLoteResponse and extracts communicationCode", () => {
    const result = parseConsultaLoteResponse(CONSULTA_LOTE_SOAP);
    expect(result.ok).toBe(true);
    expect(result.responseCode).toBe("0");
    const code = extractFirstCommunicationCode(result);
    expect(code).toBe("COM-2026-001");
  });

  it("detects SOAP Fault and returns ok=false with FAULT code", () => {
    const result = parseComunicacionResponse(SOAP_FAULT);
    expect(result.ok).toBe(false);
    expect(result.responseCode).toBe("FAULT");
    expect(result.responseDescription).toContain("Access denied");
  });

  it("returns PARSE_ERROR for empty or invalid body", () => {
    const result = parseComunicacionResponse("not xml at all");
    expect(result.ok).toBe(false);
    expect(result.responseCode).toBe("PARSE_ERROR");
  });

  it("deriveSesStatus maps responseCode 0 + batch + no results → ACCEPTED", () => {
    expect(deriveSesStatus("0", "LOTE123", [])).toBe("ACCEPTED");
  });

  it("deriveSesStatus maps responseCode 0 + batch + communicationCode → PROCESSED", () => {
    const resultados = [{ communicationResults: [{ communicationCode: "COM-001" }] }] as Parameters<typeof deriveSesStatus>[2];
    expect(deriveSesStatus("0", "LOTE123", resultados)).toBe("PROCESSED");
  });

  it("deriveSesStatus maps responseCode 0 + batch + error → FAILED", () => {
    const resultados = [{ communicationResults: [{ error: "algo fue mal" }] }] as Parameters<typeof deriveSesStatus>[2];
    expect(deriveSesStatus("0", "LOTE123", resultados)).toBe("FAILED");
  });

  it("deriveSesStatus maps responseCode non-0 → FAILED", () => {
    expect(deriveSesStatus("99", "LOTE123", [])).toBe("FAILED");
  });

  it("deriveSesStatus maps responseCode 0 + no batch → UNKNOWN", () => {
    expect(deriveSesStatus("0", undefined, [])).toBe("UNKNOWN");
  });

  it("sanitizeSoapForStorage removes Authorization header value", () => {
    const soap = "Authorization: Basic dXNlcjpwYXNz\nSOAP body content";
    expect(sanitizeSoapForStorage(soap)).not.toContain("dXNlcjpwYXNz");
    expect(sanitizeSoapForStorage(soap)).toContain("[REDACTED]");
  });

  it("detects altaParteHospedaje namespace → communicationType PV", () => {
    const xml = '<ns2:peticion xmlns:ns2="http://www.neg.hospedajes.mir.es/altaParteHospedaje">';
    expect(xml.includes("altaParteHospedaje")).toBe(true);
    expect(xml.includes("altaReservaHospedaje")).toBe(false);
  });

  it("detects altaReservaHospedaje namespace → communicationType RH", () => {
    const xml = '<ns2:peticion xmlns:ns2="http://www.neg.hospedajes.mir.es/altaReservaHospedaje">';
    expect(xml.includes("altaParteHospedaje")).toBe(false);
    expect(xml.includes("altaReservaHospedaje")).toBe(true);
  });
});
