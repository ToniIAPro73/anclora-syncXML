import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, processEntities: false, parseTagValue: true });

/** Finds the first key in an object whose local name (after ":") matches the given suffix. */
function findValue(obj: unknown, localName: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const local = key.includes(":") ? key.split(":").pop()! : key;
    if (local === localName) return value;
  }
  return undefined;
}

function str(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  return s.length ? s : undefined;
}

function asArray<T>(value: unknown): T[] {
  if (!value) return [];
  return Array.isArray(value) ? (value as T[]) : [value as T];
}

function getSoapBodyContent(rawXml: string): unknown {
  const parsed = parser.parse(rawXml);
  const envelope = findValue(parsed, "Envelope");
  const body = findValue(envelope, "Body");
  return body;
}

// ─── comunicacionResponse ────────────────────────────────────────────────────

export type ParsedComunicacionResponse = {
  ok: boolean;
  responseCode: string;
  responseDescription: string;
  /** Batch code returned by SES immediately after submission */
  sesBatchCode?: string;
  resultados: ParsedWsComunicacion[];
  rawSoapFault?: string;
};

export type ParsedWsComunicacion = {
  lote?: string;
  communicationType?: string;
  operationType?: string;
  requestedAt?: string;
  processedAt?: string;
  statusCode?: number;
  statusDescription?: string;
  communicationResults: ParsedResultadoComunicacion[];
};

export type ParsedResultadoComunicacion = {
  orden?: number;
  anulada?: boolean;
  communicationCode?: string;
  errorType?: string;
  error?: string;
};

export function parseComunicacionResponse(body: string): ParsedComunicacionResponse {
  try {
    const soapBody = getSoapBodyContent(body);
    const response = findValue(soapBody, "comunicacionResponse");

    // Detect SOAP Fault
    const fault = findValue(soapBody, "Fault");
    if (fault) {
      const faultString = str(findValue(fault, "faultstring")) ?? str(findValue(fault, "faultCode")) ?? "SOAP Fault";
      return { ok: false, responseCode: "FAULT", responseDescription: faultString, resultados: [], rawSoapFault: body };
    }

    if (!response) {
      return { ok: false, responseCode: "PARSE_ERROR", responseDescription: "No se encontró comunicacionResponse en la respuesta SOAP", resultados: [] };
    }

    const respuesta = findValue(response, "respuesta");
    const responseCode = str(findValue(respuesta, "codigo")) ?? "UNKNOWN";
    const responseDescription = str(findValue(respuesta, "descripcion")) ?? "";
    const sesBatchCode = str(findValue(respuesta, "lote"));

    const resultadosRaw = asArray<unknown>(findValue(response, "resultado"));
    const resultados = resultadosRaw.map(parseWsComunicacion);

    return {
      ok: responseCode === "0",
      responseCode,
      responseDescription,
      sesBatchCode,
      resultados,
    };
  } catch {
    return { ok: false, responseCode: "PARSE_ERROR", responseDescription: "Error al parsear respuesta SOAP", resultados: [] };
  }
}

function parseWsComunicacion(raw: unknown): ParsedWsComunicacion {
  const lote = str(findValue(raw, "lote"));
  const communicationType = str(findValue(raw, "tipoComunicacion"));
  const operationType = str(findValue(raw, "tipoOperacion"));
  const requestedAt = str(findValue(raw, "fechaPeticion"));
  const processedAt = str(findValue(raw, "fechaProcesamiento"));
  const statusCode = findValue(raw, "codigoEstado");
  const statusDescription = str(findValue(raw, "descEstado"));

  const resultadoComunicaciones = findValue(raw, "resultadoComunicaciones");
  const resultadoItems = asArray<unknown>(findValue(resultadoComunicaciones, "resultadoComunicacion"));

  return {
    lote,
    communicationType,
    operationType,
    requestedAt,
    processedAt,
    statusCode: typeof statusCode === "number" ? statusCode : statusCode ? Number(statusCode) : undefined,
    statusDescription,
    communicationResults: resultadoItems.map(parseResultadoComunicacion),
  };
}

function parseResultadoComunicacion(raw: unknown): ParsedResultadoComunicacion {
  const orden = findValue(raw, "orden");
  const anulada = findValue(raw, "anulada");
  const communicationCode = str(findValue(raw, "codigoComunicacion"));
  const errorType = str(findValue(raw, "tipoError"));
  const error = str(findValue(raw, "error"));
  return {
    orden: typeof orden === "number" ? orden : orden ? Number(orden) : undefined,
    anulada: anulada === true || anulada === "true",
    communicationCode,
    errorType,
    error,
  };
}

// ─── consultaLoteResponse ────────────────────────────────────────────────────

export type ParsedConsultaLoteResponse = {
  ok: boolean;
  responseCode: string;
  responseDescription: string;
  resultados: ParsedWsComunicacion[];
};

export function parseConsultaLoteResponse(body: string): ParsedConsultaLoteResponse {
  try {
    const soapBody = getSoapBodyContent(body);
    const response = findValue(soapBody, "consultaLoteResponse");

    const fault = findValue(soapBody, "Fault");
    if (fault) {
      const faultString = str(findValue(fault, "faultstring")) ?? "SOAP Fault";
      return { ok: false, responseCode: "FAULT", responseDescription: faultString, resultados: [] };
    }

    if (!response) {
      return { ok: false, responseCode: "PARSE_ERROR", responseDescription: "No se encontró consultaLoteResponse", resultados: [] };
    }

    const respuesta = findValue(response, "respuesta");
    const responseCode = str(findValue(respuesta, "codigo")) ?? "UNKNOWN";
    const responseDescription = str(findValue(respuesta, "descripcion")) ?? "";

    const resultadosRaw = asArray<unknown>(findValue(response, "resultado"));
    const resultados = resultadosRaw.map(parseWsComunicacion);

    return { ok: responseCode === "0", responseCode, responseDescription, resultados };
  } catch {
    return { ok: false, responseCode: "PARSE_ERROR", responseDescription: "Error al parsear consultaLoteResponse", resultados: [] };
  }
}

// ─── consultaComunicacionResponse ────────────────────────────────────────────

export type ParsedConsultaComunicacionResponse = {
  ok: boolean;
  responseCode: string;
  responseDescription: string;
  communications: unknown[];
};

export function parseConsultaComunicacionResponse(body: string): ParsedConsultaComunicacionResponse {
  try {
    const soapBody = getSoapBodyContent(body);
    const response = findValue(soapBody, "consultaComunicacionResponse");

    const fault = findValue(soapBody, "Fault");
    if (fault) {
      const faultString = str(findValue(fault, "faultstring")) ?? "SOAP Fault";
      return { ok: false, responseCode: "FAULT", responseDescription: faultString, communications: [] };
    }

    if (!response) {
      return { ok: false, responseCode: "PARSE_ERROR", responseDescription: "No se encontró consultaComunicacionResponse", communications: [] };
    }

    const resultado = findValue(response, "resultado");
    const responseCode = str(findValue(resultado, "codigo")) ?? "UNKNOWN";
    const responseDescription = str(findValue(resultado, "descripcion")) ?? "";
    const communications = asArray<unknown>(findValue(response, "comunicacion"));

    return { ok: responseCode === "0", responseCode, responseDescription, communications };
  } catch {
    return { ok: false, responseCode: "PARSE_ERROR", responseDescription: "Error al parsear consultaComunicacionResponse", communications: [] };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extracts the first communicationCode from a comunicacionResponse result set. */
export function extractFirstCommunicationCode(parsed: ParsedComunicacionResponse | ParsedConsultaLoteResponse): string | undefined {
  for (const resultado of parsed.resultados) {
    for (const rc of resultado.communicationResults) {
      if (rc.communicationCode) return rc.communicationCode;
    }
  }
  return undefined;
}

/** Maps SES response code + batch/result state to an internal submission status. */
export function deriveSesStatus(
  responseCode: string,
  sesBatchCode: string | undefined,
  resultados: ParsedWsComunicacion[],
): "ACCEPTED" | "PROCESSING" | "PROCESSED" | "FAILED" | "PARTIAL" | "UNKNOWN" | "CANCELLED" {
  if (responseCode !== "0") return "FAILED";
  if (!sesBatchCode) return "UNKNOWN";

  if (resultados.length === 0) return "ACCEPTED";

  const hasCancelled = resultados.some((r) =>
    r.communicationResults.some((rc) => rc.anulada),
  );
  const hasErrors = resultados.some((r) =>
    r.communicationResults.some((rc) => rc.error || rc.errorType),
  );
  const hasSuccess = resultados.some((r) =>
    r.communicationResults.some((rc) => rc.communicationCode && !rc.anulada),
  );

  if (hasCancelled && !hasSuccess && !hasErrors) return "CANCELLED";
  if (hasErrors && hasSuccess) return "PARTIAL";
  if (hasErrors) return "FAILED";
  if (hasSuccess) return "PROCESSED";
  return "PROCESSING";
}

/** Sanitizes a SOAP envelope body removing the Authorization header value (just in case). */
export function sanitizeSoapForStorage(soapXml: string): string {
  // Remove any Basic auth that might leak in debug output
  return soapXml.replace(/Authorization:\s*Basic\s+[A-Za-z0-9+/=]+/gi, "Authorization: [REDACTED]");
}

/** Collects all SES validation errors from resultados for storage. */
export function collectSesErrors(resultados: ParsedWsComunicacion[]): unknown[] {
  const errors: unknown[] = [];
  for (const resultado of resultados) {
    for (const rc of resultado.communicationResults) {
      if (rc.error || rc.errorType) {
        errors.push({ orden: rc.orden, tipoError: rc.errorType, error: rc.error });
      }
    }
  }
  return errors;
}
