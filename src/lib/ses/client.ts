import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { assertSesConfig, getSesConfig, type SesConfig, type SesEnvironment } from "./config";
import { zipXmlBase64 } from "./zip";

export type SesOperation = "A" | "C" | "B";
export type SesCommunicationType = "PV" | "RH" | "AV" | "RV";

export type SesRequestOptions = {
  environment?: SesEnvironment;
  dryRun?: boolean;
  fetchImpl?: typeof fetch;
};

const SOAP_NS = "http://schemas.xmlsoap.org/soap/envelope/";
const COM_NS = "http://www.soap.servicios.hospedajes.mir.es/comunicacion";

const builder = new XMLBuilder({ ignoreAttributes: false, format: true, suppressEmptyNode: false });
const parser = new XMLParser({ ignoreAttributes: false, processEntities: false });

function envelope(body: Record<string, unknown>) {
  return builder.build({
    "soapenv:Envelope": {
      "@_xmlns:soapenv": SOAP_NS,
      "@_xmlns:com": COM_NS,
      "soapenv:Header": "",
      "soapenv:Body": body,
    },
  });
}

function authHeader(config: SesConfig) {
  return `Basic ${Buffer.from(`${config.username}:${config.password}`, "utf8").toString("base64")}`;
}

async function postSoap(xml: string, config: SesConfig, fetchImpl: typeof fetch) {
  const response = await fetchImpl(config.endpoint, {
    method: "POST",
    headers: {
      authorization: authHeader(config),
      "content-type": "text/xml; charset=utf-8",
      soapaction: "",
    },
    body: xml,
  });
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body: text,
    parsed: text ? parser.parse(text) : undefined,
  };
}

export function buildComunicacionEnvelope(input: {
  config: SesConfig;
  operation: SesOperation;
  communicationType?: SesCommunicationType;
  zippedXmlBase64: string;
}) {
  return envelope({
    "com:comunicacionRequest": {
      peticion: {
        cabecera: {
          codigoArrendador: input.config.landlordCode,
          aplicacion: input.config.applicationName,
          tipoOperacion: input.operation,
          ...(input.communicationType ? { tipoComunicacion: input.communicationType } : {}),
        },
        solicitud: input.zippedXmlBase64,
      },
    },
  });
}

export function buildConsultaLoteEnvelope(loteCodes: string[]) {
  return envelope({
    "com:consultaLoteRequest": {
      codigosLote: {
        lote: loteCodes,
      },
    },
  });
}

export function buildConsultaComunicacionEnvelope(communicationCodes: string[]) {
  return envelope({
    "com:consultaComunicacionRequest": {
      codigos: {
        codigo: communicationCodes,
      },
    },
  });
}

export function buildAnulacionLoteEnvelope(loteCode: string) {
  return envelope({
    "com:anulacionLoteRequest": {
      lote: loteCode,
    },
  });
}

export function buildCatalogoEnvelope(catalog: string) {
  return envelope({
    "com:catalogoRequest": {
      peticion: {
        catalogo: catalog,
      },
    },
  });
}

export async function sendParteHospedajeXml(xml: string, options: SesRequestOptions = {}) {
  const config = getSesConfig(options.environment);
  const dryRun = options.dryRun ?? true;
  assertSesConfig(config, { requireCredentials: !dryRun });
  const zippedXmlBase64 = zipXmlBase64(xml, "altaParteHospedaje.xml");
  const soapXml = buildComunicacionEnvelope({ config, operation: "A", communicationType: "PV", zippedXmlBase64 });
  if (dryRun) return { dryRun: true, environment: config.environment, endpoint: config.endpoint, soapXml };
  return postSoap(soapXml, config, options.fetchImpl ?? fetch);
}

export const sendReservaHospedajeXml = sendParteHospedajeXml;

export async function querySesLote(loteCodes: string[], options: SesRequestOptions = {}) {
  const config = getSesConfig(options.environment);
  const dryRun = options.dryRun ?? true;
  assertSesConfig(config, { requireCredentials: !dryRun });
  const soapXml = buildConsultaLoteEnvelope(loteCodes);
  if (dryRun) return { dryRun: true, environment: config.environment, endpoint: config.endpoint, soapXml };
  return postSoap(soapXml, config, options.fetchImpl ?? fetch);
}

export async function querySesComunicacion(communicationCodes: string[], options: SesRequestOptions = {}) {
  const config = getSesConfig(options.environment);
  const dryRun = options.dryRun ?? true;
  assertSesConfig(config, { requireCredentials: !dryRun });
  const soapXml = buildConsultaComunicacionEnvelope(communicationCodes);
  if (dryRun) return { dryRun: true, environment: config.environment, endpoint: config.endpoint, soapXml };
  return postSoap(soapXml, config, options.fetchImpl ?? fetch);
}

export async function cancelSesLote(loteCode: string, options: SesRequestOptions = {}) {
  const config = getSesConfig(options.environment);
  const dryRun = options.dryRun ?? true;
  assertSesConfig(config, { requireCredentials: !dryRun });
  const soapXml = buildAnulacionLoteEnvelope(loteCode);
  if (dryRun) return { dryRun: true, environment: config.environment, endpoint: config.endpoint, soapXml };
  return postSoap(soapXml, config, options.fetchImpl ?? fetch);
}

export async function querySesCatalog(catalog: string, options: SesRequestOptions = {}) {
  const config = getSesConfig(options.environment);
  const dryRun = options.dryRun ?? true;
  assertSesConfig(config, { requireCredentials: !dryRun });
  const soapXml = buildCatalogoEnvelope(catalog);
  if (dryRun) return { dryRun: true, environment: config.environment, endpoint: config.endpoint, soapXml };
  return postSoap(soapXml, config, options.fetchImpl ?? fetch);
}
