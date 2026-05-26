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

function issue(code: string, message: string, field?: string, recommendation?: string): ValidationIssue {
  return { severity: "error", code, message, recommendation, field };
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

const FIELD_LABELS: Record<string, [string, string]> = {
  referencia: ["Falta la referencia del contrato", "Introduce el número de referencia de la reserva"],
  fechaContrato: ["Falta la fecha del contrato", "Indica la fecha en que se formalizó el contrato de alojamiento"],
  fechaEntrada: ["Falta la fecha de entrada", "Indica la fecha y hora de llegada del huésped al alojamiento"],
  fechaSalida: ["Falta la fecha de salida", "Indica la fecha y hora de salida del huésped del alojamiento"],
  numPersonas: ["Falta el número de personas", "Indica el número total de personas que se van a hospedar"],
  pago: ["Faltan los datos de pago", "Indica el tipo de pago utilizado en la reserva"],
  rol: ["Falta el rol de la persona", "Indica VI para viajero o TI para titular del contrato"],
  nombre: ["Falta el nombre del huésped", "Introduce el nombre de pila del huésped"],
  apellido1: ["Falta el primer apellido del huésped", "Introduce el primer apellido del huésped"],
  fechaNacimiento: ["Falta la fecha de nacimiento", "Introduce la fecha de nacimiento del huésped"],
  direccion: ["Falta la dirección del huésped", "Introduce la dirección de residencia del huésped"],
  codigoPostal: ["Falta el código postal", "Introduce el código postal de la dirección de residencia"],
  pais: ["Falta el país de residencia", "Introduce el código ISO alfa-3 del país (p.ej. ESP, FRA, DEU)"],
  codigoEstablecimiento: ["Falta el código del establecimiento", "Introduce el código asignado por el Sistema de Hospedajes del Ministerio"],
};

function requireField(errors: ValidationIssue[], object: Record<string, unknown>, field: string, base: string) {
  if (!text(object[field])) {
    const [message, recommendation] = FIELD_LABELS[field] ?? [`Falta el campo obligatorio: ${field}`, "Revisa los datos del Excel e introduce este campo"];
    errors.push(issue("ses.xsd.required", message, `${base}.${field}`, recommendation));
  }
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
      return { ok: false, schemaVersion: SES_SCHEMA_VERSION, kind, errors: [issue("ses.xml.malformed", "El XML no tiene un formato válido", undefined, "El XML puede estar incompleto o mal generado — vuelve a generarlo desde la aplicación")] };
    }
    const parsed = parser.parse(xml);
    const root = rootPeticion(parsed);
    if (!root) errors.push(issue("ses.xsd.root", "La estructura del XML no es correcta — falta el elemento raíz", "peticion", "Vuelve a generar el XML desde la aplicación"));
    const peticion = root?.value ?? {};
    const namespace = peticion["@_xmlns:ns2"] || peticion["@_xmlns"] || "";
    if (namespace && !String(namespace).includes(kind)) {
      errors.push(issue("ses.xsd.namespace", `El tipo de XML no corresponde al tipo de comunicación seleccionado (${kind})`, "peticion", "Asegúrate de que el XML generado es del tipo correcto (parte de viajeros o reserva de hospedaje)"));
    }

    const solicitud = peticion.solicitud ?? {};
    if (kind === "altaParteHospedaje") requireField(errors, solicitud, "codigoEstablecimiento", "solicitud");
    if (solicitud.codigoEstablecimiento && !max(solicitud.codigoEstablecimiento, 10)) {
      errors.push(issue("ses.xsd.maxLength", "El código de establecimiento supera los 10 caracteres permitidos", "solicitud.codigoEstablecimiento", "Comprueba el código de establecimiento en el sistema de Hospedajes del Ministerio"));
    }

    const comunicaciones = asArray<Record<string, any>>(solicitud.comunicacion);
    if (!comunicaciones.length) errors.push(issue("ses.xsd.required", "El XML no contiene ninguna reserva", "solicitud.comunicacion", "Comprueba que el Excel tiene datos de huéspedes y vuelve a generar el XML"));

    comunicaciones.forEach((comunicacion, communicationIndex) => {
      const base = `solicitud.comunicacion[${communicationIndex}]`;
      const contrato = comunicacion.contrato ?? {};
      ["referencia", "fechaContrato", "fechaEntrada", "fechaSalida", "numPersonas", "pago"].forEach((field) => requireField(errors, contrato, field, `${base}.contrato`));
      if (contrato.referencia && !max(contrato.referencia, HOSPEDAJES_LIMITS.reference)) errors.push(issue("ses.xsd.maxLength", "La referencia de la reserva supera los 50 caracteres permitidos", `${base}.contrato.referencia`, "Abrevia la referencia de la reserva en el Excel"));
      if (contrato.fechaContrato && !isIsoDate(contrato.fechaContrato)) errors.push(issue("ses.xsd.date", "La fecha del contrato no tiene el formato correcto", `${base}.contrato.fechaContrato`, "La fecha del contrato debe estar en formato AAAA-MM-DD (p.ej. 2026-04-20)"));
      if (contrato.fechaEntrada && !isIsoDateTime(contrato.fechaEntrada)) errors.push(issue("ses.xsd.dateTime", "La fecha de entrada no tiene el formato correcto", `${base}.contrato.fechaEntrada`, "La fecha de entrada debe estar en formato AAAA-MM-DDThh:mm:ss (p.ej. 2026-04-25T15:00:00)"));
      if (contrato.fechaSalida && !isIsoDateTime(contrato.fechaSalida)) errors.push(issue("ses.xsd.dateTime", "La fecha de salida no tiene el formato correcto", `${base}.contrato.fechaSalida`, "La fecha de salida debe estar en formato AAAA-MM-DDThh:mm:ss (p.ej. 2026-05-02T11:00:00)"));
      const checkIn = timestamp(contrato.fechaEntrada);
      const checkOut = timestamp(contrato.fechaSalida);
      if (checkIn !== undefined && checkOut !== undefined && checkOut <= checkIn) errors.push(issue("ses.business.dateOrder", "La fecha de salida debe ser posterior a la fecha de entrada", `${base}.contrato.fechaSalida`, "Comprueba que las fechas de entrada y salida son correctas y están en el orden adecuado"));
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      if (checkIn !== undefined && checkIn < oneYearAgo) errors.push(issue("ses.business.fechaEntrada.tooOld", "La fecha de entrada es demasiado antigua", `${base}.contrato.fechaEntrada`, "El Ministerio solo acepta comunicaciones con fecha de entrada en los últimos 12 meses"));
      if (contrato.numPersonas && !isInt(contrato.numPersonas)) errors.push(issue("ses.xsd.int", "El número de personas debe ser un número entero", `${base}.contrato.numPersonas`, "Introduce un número entero sin decimales ni caracteres especiales"));
      if (contrato.numPersonas && isInt(contrato.numPersonas) && Number(contrato.numPersonas) < 1) errors.push(issue("ses.business.numPersonas", "El número de personas debe ser mayor que cero", `${base}.contrato.numPersonas`, "Indica al menos 1 persona en la reserva"));
      if (contrato.numHabitaciones && !isInt(contrato.numHabitaciones)) errors.push(issue("ses.xsd.int", "El número de habitaciones debe ser un número entero", `${base}.contrato.numHabitaciones`, "Introduce un número entero sin decimales"));
      if (contrato.internet && !/^(true|false|0|1)$/.test(text(contrato.internet))) errors.push(issue("ses.xsd.boolean", "El campo 'internet' solo admite los valores true o false", `${base}.contrato.internet`, "Indica si el alojamiento tiene conexión a internet: true (sí) o false (no)"));
      if (!text(contrato.pago?.tipoPago)) errors.push(issue("ses.xsd.required", "Falta el tipo de pago en el contrato", `${base}.contrato.pago.tipoPago`, "Indica cómo se ha pagado la reserva"));
      if (contrato.pago?.tipoPago && !max(contrato.pago.tipoPago, HOSPEDAJES_LIMITS.paymentType)) errors.push(issue("ses.xsd.maxLength", "El código de tipo de pago supera los 5 caracteres permitidos", `${base}.contrato.pago.tipoPago`, "Usa uno de los códigos de pago válidos: TARJT, EFECT, TRANS, PLATF, MOVIL, TREG u OTRO"));
      if (contrato.pago?.tipoPago && !oneOf(contrato.pago.tipoPago, HOSPEDAJES_PAYMENT_TYPES)) errors.push(issue("ses.catalog.paymentType", "El tipo de pago no es válido", `${base}.contrato.pago.tipoPago`, "Usa uno de los tipos admitidos: TARJT (tarjeta), EFECT (efectivo), TRANS (transferencia), PLATF (plataforma), MOVIL (móvil), TREG (tarjeta regalo) u OTRO"));
      if (contrato.pago?.medioPago && !max(contrato.pago.medioPago, HOSPEDAJES_LIMITS.paymentMethod)) errors.push(issue("ses.xsd.maxLength", "El medio de pago supera los 50 caracteres permitidos", `${base}.contrato.pago.medioPago`, "Abrevia la descripción del medio de pago"));
      if (contrato.pago?.titular && !max(contrato.pago.titular, HOSPEDAJES_LIMITS.paymentHolder)) errors.push(issue("ses.xsd.maxLength", "El titular del pago supera los 100 caracteres permitidos", `${base}.contrato.pago.titular`, "Abrevia el nombre del titular del pago"));
      if (contrato.pago?.caducidadTarjeta && !max(contrato.pago.caducidadTarjeta, HOSPEDAJES_LIMITS.cardExpiry)) errors.push(issue("ses.xsd.maxLength", "La caducidad de la tarjeta supera los 7 caracteres permitidos", `${base}.contrato.pago.caducidadTarjeta`, "La caducidad de la tarjeta debe tener formato MM/AAAA o similar de hasta 7 caracteres"));

      const personas = asArray<Record<string, any>>(comunicacion.persona);
      if (!personas.length) errors.push(issue("ses.xsd.required", "La reserva no contiene ningún huésped", `${base}.persona`, "Comprueba que el Excel tiene filas de huéspedes para esta reserva"));
      if (isInt(contrato.numPersonas) && Number(contrato.numPersonas) !== personas.length) {
        errors.push(issue("ses.xsd.numPersonas", "El número de personas declarado no coincide con el número de huéspedes en el XML", `${base}.contrato.numPersonas`, "Asegúrate de que el número de personas en la cabecera coincide exactamente con el número de filas de huéspedes"));
      }

      personas.forEach((persona, personIndex) => {
        const personBase = `${base}.persona[${personIndex}]`;
        ["rol", "nombre", "apellido1", "fechaNacimiento", "direccion"].forEach((field) => requireField(errors, persona, field, personBase));
        if (persona.rol && !["VI", "CP", "CS", "TI"].includes(text(persona.rol))) errors.push(issue("ses.xsd.enum", "El rol de la persona no es válido", `${personBase}.rol`, "El rol debe ser VI (viajero) o TI (titular del contrato)"));
        const age = ageFromXmlDate(persona.fechaNacimiento);
        const isAdult = age !== undefined && age >= 18;
        const isMinor = age !== undefined && age >= 0 && age < 18;
        if (persona.nombre && !max(persona.nombre, HOSPEDAJES_LIMITS.firstName)) errors.push(issue("ses.xsd.maxLength", "El nombre del huésped supera los 50 caracteres permitidos", `${personBase}.nombre`, "Abrevia el nombre para que no supere 50 caracteres"));
        if (persona.apellido1 && !max(persona.apellido1, HOSPEDAJES_LIMITS.surname)) errors.push(issue("ses.xsd.maxLength", "El primer apellido supera los 50 caracteres permitidos", `${personBase}.apellido1`, "Abrevia el apellido para que no supere 50 caracteres"));
        if (persona.apellido2 && !max(persona.apellido2, HOSPEDAJES_LIMITS.surname)) errors.push(issue("ses.xsd.maxLength", "El segundo apellido supera los 50 caracteres permitidos", `${personBase}.apellido2`, "Abrevia el apellido para que no supere 50 caracteres"));
        if (text(persona.tipoDocumento).toUpperCase() === "NIF" && !text(persona.apellido2)) errors.push(issue("ses.business.surname2.requiredForNif", "Con documento NIF, el segundo apellido es obligatorio", `${personBase}.apellido2`, "Añade el segundo apellido del huésped en el Excel"));
        if (isAdult && !text(persona.tipoDocumento)) errors.push(issue("ses.business.documentType.requiredForAdult", "Falta el tipo de documento (obligatorio para mayores de 18 años)", `${personBase}.tipoDocumento`, "Indica el tipo: NIF, NIE, PAS u OTRO"));
        if (isAdult && !text(persona.numeroDocumento)) errors.push(issue("ses.business.documentNumber.requiredForAdult", "Falta el número de documento (obligatorio para mayores de 18 años)", `${personBase}.numeroDocumento`, "Introduce el número de NIF, NIE, pasaporte u otro documento de identidad"));
        if (persona.tipoDocumento && !max(persona.tipoDocumento, HOSPEDAJES_LIMITS.documentType)) errors.push(issue("ses.xsd.maxLength", "El código de tipo de documento supera los 5 caracteres permitidos", `${personBase}.tipoDocumento`, "Usa uno de los códigos válidos: NIF, NIE, PAS u OTRO"));
        if (persona.tipoDocumento && !oneOf(persona.tipoDocumento, HOSPEDAJES_DOCUMENT_TYPES)) errors.push(issue("ses.catalog.documentType", "Tipo de documento no válido", `${personBase}.tipoDocumento`, "Usa uno de los tipos admitidos: NIF (DNI español), NIE (extranjero con residencia), PAS (pasaporte) u OTRO"));
        if (persona.numeroDocumento && !max(persona.numeroDocumento, HOSPEDAJES_LIMITS.documentNumber)) errors.push(issue("ses.xsd.maxLength", "El número de documento supera los 15 caracteres permitidos", `${personBase}.numeroDocumento`, "Revisa que el número de documento no tiene espacios ni caracteres extra"));
        if (requiresSpanishDocumentSupport(text(persona.tipoDocumento)) && !text(persona.soporteDocumento)) errors.push(issue("ses.business.documentSupport.required", "Para NIF o NIE, el número de soporte del documento es obligatorio", `${personBase}.soporteDocumento`, "Introduce el número de soporte que aparece en el reverso del DNI o en el NIE"));
        if (persona.soporteDocumento && !max(persona.soporteDocumento, HOSPEDAJES_LIMITS.documentSupport)) errors.push(issue("ses.xsd.maxLength", "El número de soporte supera los 9 caracteres permitidos", `${personBase}.soporteDocumento`, "El número de soporte del DNI/NIE tiene exactamente 9 caracteres alfanuméricos"));
        if (persona.fechaNacimiento && !isIsoDate(persona.fechaNacimiento)) errors.push(issue("ses.xsd.date", "La fecha de nacimiento no tiene el formato correcto", `${personBase}.fechaNacimiento`, "La fecha de nacimiento debe estar en formato AAAA-MM-DD (p.ej. 1985-03-15)"));
        if (persona.nacionalidad && !isIso3(persona.nacionalidad)) errors.push(issue("ses.xsd.pattern", "El código de nacionalidad no es válido", `${personBase}.nacionalidad`, "Usa el código ISO alfa-3 de 3 letras mayúsculas (p.ej. ESP, FRA, DEU)"));
        if (persona.sexo && !max(persona.sexo, 1)) errors.push(issue("ses.xsd.maxLength", "El campo sexo supera 1 carácter", `${personBase}.sexo`, "El sexo debe ser H (hombre), M (mujer) u O (otro)"));
        if (persona.sexo && !oneOf(persona.sexo, HOSPEDAJES_SEX_VALUES)) errors.push(issue("ses.catalog.sex", "El valor del campo sexo no es válido", `${personBase}.sexo`, "Usa H (hombre), M (mujer) u O (otro)"));
        if (!hasContact(persona)) errors.push(issue("ses.business.contact.required", "Falta el dato de contacto del huésped", `${personBase}.telefono`, "Introduce al menos un teléfono o dirección de email de contacto"));
        if (persona.correo && (!min(persona.correo, 1) || !max(persona.correo, HOSPEDAJES_LIMITS.email) || !/^[^@]+@[^.]+\..+/.test(text(persona.correo)))) errors.push(issue("ses.xsd.pattern", "El email no tiene un formato válido", `${personBase}.correo`, "El email debe tener el formato nombre@dominio.ext (p.ej. juan@ejemplo.com)"));
        if (persona.telefono && !max(persona.telefono, HOSPEDAJES_LIMITS.phone)) errors.push(issue("ses.xsd.maxLength", "El teléfono supera los 20 caracteres permitidos", `${personBase}.telefono`, "Elimina espacios o caracteres extra del número de teléfono"));
        if (persona.telefono2 && !max(persona.telefono2, HOSPEDAJES_LIMITS.phone)) errors.push(issue("ses.xsd.maxLength", "El segundo teléfono supera los 20 caracteres permitidos", `${personBase}.telefono2`, "Elimina espacios o caracteres extra del segundo número de teléfono"));
        if (isMinor && !text(persona.parentesco)) errors.push(issue("ses.business.relationship.requiredForMinor", "Para menores de edad, es obligatorio indicar el parentesco con el adulto acompañante", `${personBase}.parentesco`, "Indica el parentesco del menor con el adulto que viaja con él (p.ej. HJ para hijo/a, PM para padre/madre)"));
        if (persona.parentesco && !max(persona.parentesco, HOSPEDAJES_LIMITS.relationship)) errors.push(issue("ses.xsd.maxLength", "El código de parentesco supera los 2 caracteres permitidos", `${personBase}.parentesco`, "El código de parentesco es siempre de 2 letras (p.ej. HJ para hijo/a, PM para padre/madre)"));
        if (persona.parentesco && !oneOf(persona.parentesco, HOSPEDAJES_RELATIONSHIP_VALUES)) errors.push(issue("ses.catalog.relationship", "El parentesco indicado no es válido según el catálogo del Ministerio", `${personBase}.parentesco`, "Consulta el catálogo TIPO_PARENTESCO. Valores habituales: HJ (hijo/a), PM (padre/madre), AB (abuelo/a), HE (hermano/a)"));
        const direccion = persona.direccion ?? {};
        ["direccion", "codigoPostal", "pais"].forEach((field) => requireField(errors, direccion, field, `${personBase}.direccion`));
        if (direccion.direccion && !max(direccion.direccion, 100)) errors.push(issue("ses.xsd.maxLength", "La dirección supera los 100 caracteres permitidos", `${personBase}.direccion.direccion`, "Abrevia la dirección para que no supere 100 caracteres"));
        if (direccion.direccionComplementaria && !max(direccion.direccionComplementaria, 100)) errors.push(issue("ses.xsd.maxLength", "La dirección complementaria supera los 100 caracteres permitidos", `${personBase}.direccion.direccionComplementaria`, "Abrevia la dirección complementaria"));
        if (direccion.codigoMunicipio && !/^[0-9]{5}$/.test(text(direccion.codigoMunicipio))) errors.push(issue("ses.xsd.pattern", "El código de municipio debe tener exactamente 5 dígitos", `${personBase}.direccion.codigoMunicipio`, "El código INE del municipio tiene siempre 5 dígitos (p.ej. 46215 para Riola)"));
        if (direccion.nombreMunicipio && !max(direccion.nombreMunicipio, 100)) errors.push(issue("ses.xsd.maxLength", "El nombre del municipio supera los 100 caracteres permitidos", `${personBase}.direccion.nombreMunicipio`, "Abrevia el nombre del municipio o ciudad"));
        if (direccion.codigoPostal && !max(direccion.codigoPostal, 20)) errors.push(issue("ses.xsd.maxLength", "El código postal supera los 20 caracteres permitidos", `${personBase}.direccion.codigoPostal`, "Revisa que el código postal no tiene espacios ni caracteres extra"));
        if (direccion.pais && !isIso3(direccion.pais)) errors.push(issue("ses.xsd.pattern", "El código de país no es válido", `${personBase}.direccion.pais`, "Usa el código ISO alfa-3 de 3 letras mayúsculas (p.ej. ESP para España)"));
        if (text(direccion.pais).toUpperCase() === "ESP" && !text(direccion.codigoMunicipio)) errors.push(issue("ses.business.municipalityCode.required", "Para residentes en España, el código de municipio INE es obligatorio", `${personBase}.direccion.codigoMunicipio`, "Busca el código INE del municipio en ine.es o selecciónalo desde el buscador de municipios de la aplicación"));
        if (text(direccion.pais).toUpperCase() !== "ESP" && !text(direccion.nombreMunicipio)) errors.push(issue("ses.business.nombreMunicipio.required", "Para residentes fuera de España, el nombre del municipio o ciudad es obligatorio", `${personBase}.direccion.nombreMunicipio`, "Introduce el nombre de la ciudad o municipio de residencia del huésped"));
      });
    });
  } catch (error) {
    errors.push(issue("ses.xml.validation_failed", error instanceof Error ? error.message : "Validación SES no completada"));
  }

  return { ok: errors.length === 0, schemaVersion: SES_SCHEMA_VERSION, kind, errors };
}
