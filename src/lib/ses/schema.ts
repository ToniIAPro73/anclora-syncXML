import { readFileSync } from "node:fs";
import path from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { ValidationIssue } from "@/lib/domain";
import { SES_SCHEMA_DIR, SES_SCHEMA_VERSION } from "./config";

export type SesSchemaKind = "altaParteHospedaje" | "altaReservaHospedaje";

const parser = new XMLParser({ ignoreAttributes: false, processEntities: false, parseTagValue: false });

function issue(code: string, message: string, field?: string): ValidationIssue {
  return { severity: "error", code, message, field };
}

function rejectDangerousXml(xml: string) {
  if (/<!ENTITY|<!DOCTYPE/i.test(xml)) throw new Error("XML peligroso no permitido");
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function isIsoDate(value: unknown) {
  return /^\d{4}-\d{2}-\d{2}(Z|[+-]\d{2}:\d{2})?$/.test(text(value));
}

function isIsoDateTime(value: unknown) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(text(value));
}

function isIso3(value: unknown) {
  return /^[A-Za-z]{3}$/.test(text(value));
}

function isInt(value: unknown) {
  return /^-?\d+$/.test(text(value));
}

function max(value: unknown, length: number) {
  return text(value).length <= length;
}

function requireField(errors: ValidationIssue[], object: Record<string, unknown>, field: string, base: string) {
  if (!text(object[field])) errors.push(issue("ses.xsd.required", `Campo obligatorio ausente: ${base}.${field}`, `${base}.${field}`));
}

function rootPeticion(parsed: Record<string, any>) {
  const rootName = Object.keys(parsed).find((key) => key === "peticion" || key.endsWith(":peticion"));
  return rootName ? { name: rootName, value: parsed[rootName] } : undefined;
}

export function getSesSchemaSource(kind: SesSchemaKind) {
  const fileName = `${kind}.xsd`;
  return readFileSync(path.join(process.cwd(), SES_SCHEMA_DIR, fileName), "utf8");
}

export function validateSesHospedajesXml(xml: string, kind: SesSchemaKind = "altaParteHospedaje") {
  const errors: ValidationIssue[] = [];
  try {
    rejectDangerousXml(xml);
    const wellFormed = XMLValidator.validate(xml);
    if (wellFormed !== true) {
      return { ok: false, schemaVersion: SES_SCHEMA_VERSION, kind, errors: [issue("ses.xml.malformed", "XML mal formado")] };
    }
    const parsed = parser.parse(xml);
    const root = rootPeticion(parsed);
    if (!root) errors.push(issue("ses.xsd.root", "La raiz debe ser peticion", "peticion"));
    const peticion = root?.value ?? {};
    const namespace = peticion["@_xmlns:ns2"] || peticion["@_xmlns"] || "";
    if (namespace && !String(namespace).includes(kind)) {
      errors.push(issue("ses.xsd.namespace", `Namespace incompatible con ${kind}`, "peticion"));
    }

    const solicitud = peticion.solicitud ?? {};
    if (kind === "altaParteHospedaje") requireField(errors, solicitud, "codigoEstablecimiento", "solicitud");
    if (solicitud.codigoEstablecimiento && !max(solicitud.codigoEstablecimiento, 10)) {
      errors.push(issue("ses.xsd.maxLength", "codigoEstablecimiento excede 10 caracteres", "solicitud.codigoEstablecimiento"));
    }

    const comunicaciones = asArray<Record<string, any>>(solicitud.comunicacion);
    if (!comunicaciones.length) errors.push(issue("ses.xsd.required", "Debe existir al menos una comunicacion", "solicitud.comunicacion"));

    comunicaciones.forEach((comunicacion, communicationIndex) => {
      const base = `solicitud.comunicacion[${communicationIndex}]`;
      const contrato = comunicacion.contrato ?? {};
      ["referencia", "fechaContrato", "fechaEntrada", "fechaSalida", "numPersonas", "pago"].forEach((field) => requireField(errors, contrato, field, `${base}.contrato`));
      if (contrato.referencia && !max(contrato.referencia, 50)) errors.push(issue("ses.xsd.maxLength", "referencia excede 50 caracteres", `${base}.contrato.referencia`));
      if (contrato.fechaContrato && !isIsoDate(contrato.fechaContrato)) errors.push(issue("ses.xsd.date", "fechaContrato no cumple xsd:date", `${base}.contrato.fechaContrato`));
      if (contrato.fechaEntrada && !isIsoDateTime(contrato.fechaEntrada)) errors.push(issue("ses.xsd.dateTime", "fechaEntrada no cumple xsd:dateTime", `${base}.contrato.fechaEntrada`));
      if (contrato.fechaSalida && !isIsoDateTime(contrato.fechaSalida)) errors.push(issue("ses.xsd.dateTime", "fechaSalida no cumple xsd:dateTime", `${base}.contrato.fechaSalida`));
      if (contrato.numPersonas && !isInt(contrato.numPersonas)) errors.push(issue("ses.xsd.int", "numPersonas debe ser entero", `${base}.contrato.numPersonas`));
      if (contrato.internet && !/^(true|false|0|1)$/.test(text(contrato.internet))) errors.push(issue("ses.xsd.boolean", "internet debe ser boolean", `${base}.contrato.internet`));
      if (!text(contrato.pago?.tipoPago)) errors.push(issue("ses.xsd.required", "tipoPago es obligatorio", `${base}.contrato.pago.tipoPago`));
      if (contrato.pago?.tipoPago && !max(contrato.pago.tipoPago, 5)) errors.push(issue("ses.xsd.maxLength", "tipoPago excede 5 caracteres", `${base}.contrato.pago.tipoPago`));

      const personas = asArray<Record<string, any>>(comunicacion.persona);
      if (!personas.length) errors.push(issue("ses.xsd.required", "Debe existir al menos una persona", `${base}.persona`));
      if (isInt(contrato.numPersonas) && Number(contrato.numPersonas) !== personas.length) {
        errors.push(issue("ses.xsd.numPersonas", "numPersonas no coincide con el numero de personas", `${base}.contrato.numPersonas`));
      }

      personas.forEach((persona, personIndex) => {
        const personBase = `${base}.persona[${personIndex}]`;
        ["rol", "nombre", "apellido1", "fechaNacimiento", "direccion"].forEach((field) => requireField(errors, persona, field, personBase));
        if (persona.rol && !["VI", "CP", "CS", "TI"].includes(text(persona.rol))) errors.push(issue("ses.xsd.enum", "rol no admitido por XSD", `${personBase}.rol`));
        if (persona.nombre && !max(persona.nombre, 50)) errors.push(issue("ses.xsd.maxLength", "nombre excede 50 caracteres", `${personBase}.nombre`));
        if (persona.apellido1 && !max(persona.apellido1, 50)) errors.push(issue("ses.xsd.maxLength", "apellido1 excede 50 caracteres", `${personBase}.apellido1`));
        if (persona.numeroDocumento && !max(persona.numeroDocumento, 15)) errors.push(issue("ses.xsd.maxLength", "numeroDocumento excede 15 caracteres", `${personBase}.numeroDocumento`));
        if (persona.fechaNacimiento && !isIsoDate(persona.fechaNacimiento)) errors.push(issue("ses.xsd.date", "fechaNacimiento no cumple xsd:date", `${personBase}.fechaNacimiento`));
        if (persona.nacionalidad && !isIso3(persona.nacionalidad)) errors.push(issue("ses.xsd.pattern", "nacionalidad debe ser ISO alfa-3", `${personBase}.nacionalidad`));
        if (persona.correo && !/^[^@]+@[^.]+\..+/.test(text(persona.correo))) errors.push(issue("ses.xsd.pattern", "correo no cumple patron XSD", `${personBase}.correo`));
        if (persona.telefono && !max(persona.telefono, 20)) errors.push(issue("ses.xsd.maxLength", "telefono excede 20 caracteres", `${personBase}.telefono`));
        const direccion = persona.direccion ?? {};
        ["direccion", "codigoPostal", "pais"].forEach((field) => requireField(errors, direccion, field, `${personBase}.direccion`));
        if (direccion.codigoMunicipio && !/^[0-9]{5}$/.test(text(direccion.codigoMunicipio))) errors.push(issue("ses.xsd.pattern", "codigoMunicipio debe tener 5 digitos", `${personBase}.direccion.codigoMunicipio`));
        if (direccion.pais && !isIso3(direccion.pais)) errors.push(issue("ses.xsd.pattern", "pais debe ser ISO alfa-3", `${personBase}.direccion.pais`));
      });
    });
  } catch (error) {
    errors.push(issue("ses.xml.validation_failed", error instanceof Error ? error.message : "Validacion SES no completada"));
  }

  return { ok: errors.length === 0, schemaVersion: SES_SCHEMA_VERSION, kind, errors };
}
