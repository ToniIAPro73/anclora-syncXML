import { readFileSync } from "node:fs";
import path from "node:path";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { ValidationIssue } from "@/lib/domain";
import { SES_SCHEMA_DIR, SES_SCHEMA_VERSION } from "./config";
import {
  HOSPEDAJES_DOCUMENT_TYPES,
  HOSPEDAJES_LIMITS,
  HOSPEDAJES_PAYMENT_TYPES,
  HOSPEDAJES_RELATIONSHIP_VALUES,
  HOSPEDAJES_SEX_VALUES,
  getAgeOn,
  requiresSpanishDocumentSupport,
} from "./hospedajesRules";

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

function min(value: unknown, length: number) {
  return text(value).length >= length;
}

function oneOf(value: unknown, allowed: Set<string>) {
  return allowed.has(text(value).toUpperCase());
}

function timestamp(value: unknown) {
  const raw = text(value);
  if (!isIsoDateTime(raw)) return undefined;
  const parsed = Date.parse(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function ageFromXmlDate(value: unknown) {
  const raw = text(value).slice(0, 10);
  if (!isIsoDate(raw)) return undefined;
  return getAgeOn(raw);
}

function hasContact(persona: Record<string, any>) {
  return Boolean(text(persona.telefono) || text(persona.telefono2) || text(persona.correo));
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
    if (!root) errors.push(issue("ses.xsd.root", "La raíz debe ser peticion", "peticion"));
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
    if (!comunicaciones.length) errors.push(issue("ses.xsd.required", "Debe existir al menos una comunicación", "solicitud.comunicacion"));

    comunicaciones.forEach((comunicacion, communicationIndex) => {
      const base = `solicitud.comunicacion[${communicationIndex}]`;
      const contrato = comunicacion.contrato ?? {};
      ["referencia", "fechaContrato", "fechaEntrada", "fechaSalida", "numPersonas", "pago"].forEach((field) => requireField(errors, contrato, field, `${base}.contrato`));
      if (contrato.referencia && !max(contrato.referencia, HOSPEDAJES_LIMITS.reference)) errors.push(issue("ses.xsd.maxLength", "referencia excede 50 caracteres", `${base}.contrato.referencia`));
      if (contrato.fechaContrato && !isIsoDate(contrato.fechaContrato)) errors.push(issue("ses.xsd.date", "fechaContrato no cumple xsd:date", `${base}.contrato.fechaContrato`));
      if (contrato.fechaEntrada && !isIsoDateTime(contrato.fechaEntrada)) errors.push(issue("ses.xsd.dateTime", "fechaEntrada no cumple xsd:dateTime", `${base}.contrato.fechaEntrada`));
      if (contrato.fechaSalida && !isIsoDateTime(contrato.fechaSalida)) errors.push(issue("ses.xsd.dateTime", "fechaSalida no cumple xsd:dateTime", `${base}.contrato.fechaSalida`));
      const checkIn = timestamp(contrato.fechaEntrada);
      const checkOut = timestamp(contrato.fechaSalida);
      if (checkIn !== undefined && checkOut !== undefined && checkOut <= checkIn) errors.push(issue("ses.business.dateOrder", "fechaSalida debe ser posterior a fechaEntrada", `${base}.contrato.fechaSalida`));
      if (contrato.numPersonas && !isInt(contrato.numPersonas)) errors.push(issue("ses.xsd.int", "numPersonas debe ser entero", `${base}.contrato.numPersonas`));
      if (contrato.numPersonas && isInt(contrato.numPersonas) && Number(contrato.numPersonas) < 1) errors.push(issue("ses.business.numPersonas", "numPersonas debe ser mayor que cero", `${base}.contrato.numPersonas`));
      if (contrato.numHabitaciones && !isInt(contrato.numHabitaciones)) errors.push(issue("ses.xsd.int", "numHabitaciones debe ser entero", `${base}.contrato.numHabitaciones`));
      if (contrato.internet && !/^(true|false|0|1)$/.test(text(contrato.internet))) errors.push(issue("ses.xsd.boolean", "internet debe ser boolean", `${base}.contrato.internet`));
      if (!text(contrato.pago?.tipoPago)) errors.push(issue("ses.xsd.required", "tipoPago es obligatorio", `${base}.contrato.pago.tipoPago`));
      if (contrato.pago?.tipoPago && !max(contrato.pago.tipoPago, HOSPEDAJES_LIMITS.paymentType)) errors.push(issue("ses.xsd.maxLength", "tipoPago excede 5 caracteres", `${base}.contrato.pago.tipoPago`));
      if (contrato.pago?.tipoPago && !oneOf(contrato.pago.tipoPago, HOSPEDAJES_PAYMENT_TYPES)) errors.push(issue("ses.catalog.paymentType", "tipoPago no está en el catálogo admitido", `${base}.contrato.pago.tipoPago`));
      if (contrato.pago?.medioPago && !max(contrato.pago.medioPago, HOSPEDAJES_LIMITS.paymentMethod)) errors.push(issue("ses.xsd.maxLength", "medioPago excede 50 caracteres", `${base}.contrato.pago.medioPago`));
      if (contrato.pago?.titular && !max(contrato.pago.titular, HOSPEDAJES_LIMITS.paymentHolder)) errors.push(issue("ses.xsd.maxLength", "titular excede 100 caracteres", `${base}.contrato.pago.titular`));
      if (contrato.pago?.caducidadTarjeta && !max(contrato.pago.caducidadTarjeta, HOSPEDAJES_LIMITS.cardExpiry)) errors.push(issue("ses.xsd.maxLength", "caducidadTarjeta excede 7 caracteres", `${base}.contrato.pago.caducidadTarjeta`));

      const personas = asArray<Record<string, any>>(comunicacion.persona);
      if (!personas.length) errors.push(issue("ses.xsd.required", "Debe existir al menos una persona", `${base}.persona`));
      if (isInt(contrato.numPersonas) && Number(contrato.numPersonas) !== personas.length) {
        errors.push(issue("ses.xsd.numPersonas", "numPersonas no coincide con el número de personas", `${base}.contrato.numPersonas`));
      }

      personas.forEach((persona, personIndex) => {
        const personBase = `${base}.persona[${personIndex}]`;
        ["rol", "nombre", "apellido1", "fechaNacimiento", "direccion"].forEach((field) => requireField(errors, persona, field, personBase));
        if (persona.rol && !["VI", "CP", "CS", "TI"].includes(text(persona.rol))) errors.push(issue("ses.xsd.enum", "rol no admitido por XSD", `${personBase}.rol`));
        const age = ageFromXmlDate(persona.fechaNacimiento);
        const isAdult = age !== undefined && age >= 18;
        const isMinor = age !== undefined && age >= 0 && age < 18;
        if (persona.nombre && !max(persona.nombre, HOSPEDAJES_LIMITS.firstName)) errors.push(issue("ses.xsd.maxLength", "nombre excede 50 caracteres", `${personBase}.nombre`));
        if (persona.apellido1 && !max(persona.apellido1, HOSPEDAJES_LIMITS.surname)) errors.push(issue("ses.xsd.maxLength", "apellido1 excede 50 caracteres", `${personBase}.apellido1`));
        if (persona.apellido2 && !max(persona.apellido2, HOSPEDAJES_LIMITS.surname)) errors.push(issue("ses.xsd.maxLength", "apellido2 excede 50 caracteres", `${personBase}.apellido2`));
        if (text(persona.tipoDocumento).toUpperCase() === "NIF" && !text(persona.apellido2)) errors.push(issue("ses.business.surname2.requiredForNif", "apellido2 es obligatorio cuando tipoDocumento es NIF", `${personBase}.apellido2`));
        if (isAdult && !text(persona.tipoDocumento)) errors.push(issue("ses.business.documentType.requiredForAdult", "tipoDocumento es obligatorio para mayores de edad", `${personBase}.tipoDocumento`));
        if (isAdult && !text(persona.numeroDocumento)) errors.push(issue("ses.business.documentNumber.requiredForAdult", "numeroDocumento es obligatorio para mayores de edad", `${personBase}.numeroDocumento`));
        if (persona.tipoDocumento && !max(persona.tipoDocumento, HOSPEDAJES_LIMITS.documentType)) errors.push(issue("ses.xsd.maxLength", "tipoDocumento excede 5 caracteres", `${personBase}.tipoDocumento`));
        if (persona.tipoDocumento && !oneOf(persona.tipoDocumento, HOSPEDAJES_DOCUMENT_TYPES)) errors.push(issue("ses.catalog.documentType", "tipoDocumento no está en el catálogo admitido", `${personBase}.tipoDocumento`));
        if (persona.numeroDocumento && !max(persona.numeroDocumento, HOSPEDAJES_LIMITS.documentNumber)) errors.push(issue("ses.xsd.maxLength", "numeroDocumento excede 15 caracteres", `${personBase}.numeroDocumento`));
        if (requiresSpanishDocumentSupport(text(persona.tipoDocumento)) && !text(persona.soporteDocumento)) errors.push(issue("ses.business.documentSupport.required", "soporteDocumento es obligatorio para NIF/NIE", `${personBase}.soporteDocumento`));
        if (persona.soporteDocumento && !max(persona.soporteDocumento, HOSPEDAJES_LIMITS.documentSupport)) errors.push(issue("ses.xsd.maxLength", "soporteDocumento excede 9 caracteres", `${personBase}.soporteDocumento`));
        if (persona.fechaNacimiento && !isIsoDate(persona.fechaNacimiento)) errors.push(issue("ses.xsd.date", "fechaNacimiento no cumple xsd:date", `${personBase}.fechaNacimiento`));
        if (persona.nacionalidad && !isIso3(persona.nacionalidad)) errors.push(issue("ses.xsd.pattern", "nacionalidad debe ser ISO alfa-3", `${personBase}.nacionalidad`));
        if (persona.sexo && !max(persona.sexo, 1)) errors.push(issue("ses.xsd.maxLength", "sexo excede 1 caracter", `${personBase}.sexo`));
        if (persona.sexo && !oneOf(persona.sexo, HOSPEDAJES_SEX_VALUES)) errors.push(issue("ses.catalog.sex", "sexo no está en el catálogo admitido", `${personBase}.sexo`));
        if (!hasContact(persona)) errors.push(issue("ses.business.contact.required", "Debe existir al menos telefono, telefono2 o correo", `${personBase}.telefono`));
        if (persona.correo && (!min(persona.correo, 1) || !max(persona.correo, HOSPEDAJES_LIMITS.email) || !/^[^@]+@[^.]+\..+/.test(text(persona.correo)))) errors.push(issue("ses.xsd.pattern", "correo no cumple patrón XSD", `${personBase}.correo`));
        if (persona.telefono && !max(persona.telefono, HOSPEDAJES_LIMITS.phone)) errors.push(issue("ses.xsd.maxLength", "telefono excede 20 caracteres", `${personBase}.telefono`));
        if (persona.telefono2 && !max(persona.telefono2, HOSPEDAJES_LIMITS.phone)) errors.push(issue("ses.xsd.maxLength", "telefono2 excede 20 caracteres", `${personBase}.telefono2`));
        if (isMinor && !text(persona.parentesco)) errors.push(issue("ses.business.relationship.requiredForMinor", "parentesco es obligatorio cuando la persona es menor de edad", `${personBase}.parentesco`));
        if (persona.parentesco && !max(persona.parentesco, HOSPEDAJES_LIMITS.relationship)) errors.push(issue("ses.xsd.maxLength", "parentesco excede 2 caracteres", `${personBase}.parentesco`));
        if (persona.parentesco && !oneOf(persona.parentesco, HOSPEDAJES_RELATIONSHIP_VALUES)) errors.push(issue("ses.catalog.relationship", "parentesco no está en el catálogo admitido", `${personBase}.parentesco`));
        const direccion = persona.direccion ?? {};
        ["direccion", "codigoPostal", "pais"].forEach((field) => requireField(errors, direccion, field, `${personBase}.direccion`));
        if (direccion.direccion && !max(direccion.direccion, 100)) errors.push(issue("ses.xsd.maxLength", "direccion excede 100 caracteres", `${personBase}.direccion.direccion`));
        if (direccion.direccionComplementaria && !max(direccion.direccionComplementaria, 100)) errors.push(issue("ses.xsd.maxLength", "direccionComplementaria excede 100 caracteres", `${personBase}.direccion.direccionComplementaria`));
        if (direccion.codigoMunicipio && !/^[0-9]{5}$/.test(text(direccion.codigoMunicipio))) errors.push(issue("ses.xsd.pattern", "codigoMunicipio debe tener 5 dígitos", `${personBase}.direccion.codigoMunicipio`));
        if (direccion.nombreMunicipio && !max(direccion.nombreMunicipio, 100)) errors.push(issue("ses.xsd.maxLength", "nombreMunicipio excede 100 caracteres", `${personBase}.direccion.nombreMunicipio`));
        if (direccion.codigoPostal && !max(direccion.codigoPostal, 20)) errors.push(issue("ses.xsd.maxLength", "codigoPostal excede 20 caracteres", `${personBase}.direccion.codigoPostal`));
        if (direccion.pais && !isIso3(direccion.pais)) errors.push(issue("ses.xsd.pattern", "pais debe ser ISO alfa-3", `${personBase}.direccion.pais`));
        if (text(direccion.pais).toUpperCase() === "ESP" && !text(direccion.codigoMunicipio)) errors.push(issue("ses.business.municipalityCode.required", "codigoMunicipio es obligatorio cuando pais es ESP", `${personBase}.direccion.codigoMunicipio`));
        if (text(direccion.pais).toUpperCase() !== "ESP" && !text(direccion.nombreMunicipio)) errors.push(issue("ses.business.nombreMunicipio.required", "nombreMunicipio es obligatorio cuando pais no es ESP", `${personBase}.direccion.nombreMunicipio`));
      });
    });
  } catch (error) {
    errors.push(issue("ses.xml.validation_failed", error instanceof Error ? error.message : "Validación SES no completada"));
  }

  return { ok: errors.length === 0, schemaVersion: SES_SCHEMA_VERSION, kind, errors };
}
