import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Ban,
  ClipboardCheck,
  Copy,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Handshake,
  ListChecks,
  Network,
  Search,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserCheck,
  Users,
} from "lucide-react";

/* Routes that the landing CTAs point to. */
export const APP_HREF = "/app";
export const LOGIN_HREF = "/login";
export const PILOT_HREF = "/piloto";
export const PRIVACY_HREF = "/privacy";
export const TERMS_HREF = "/terms";

/* Contact channel for the controlled pilot. Change this to the official
   pilot inbox when one is available. */
export const PILOT_EMAIL = "antonio@anclora.com";

function mailto(subject: string, body?: string) {
  let href = `mailto:${PILOT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  if (body) href += `&body=${encodeURIComponent(body)}`;
  return href;
}

export const PILOT_MAILTO = mailto(
  "Solicitud de piloto controlado — Anclora SyncXML",
  "Hola,\n\nMe gustaría solicitar un piloto controlado de Anclora SyncXML con datos sintéticos o anonimizados.\n\nAlojamiento / gestor:\nNº de inmuebles aprox.:\nHerramienta actual (Excel/PMS):\n\nGracias.",
);
export const DIAGNOSTIC_MAILTO = mailto(
  "Solicitud de diagnóstico inicial — Anclora SyncXML",
  "Hola,\n\nMe gustaría solicitar un diagnóstico inicial de mi flujo Excel/XLSX para valorar el encaje con Anclora SyncXML.\n\nAlojamiento / gestor:\nNº de inmuebles aprox.:\nHerramienta actual (Excel/PMS):\n\nGracias.",
);
export const PLAN_MAILTO = mailto(
  "Plan a medida — Anclora SyncXML",
  "Hola,\n\nTras valorar el piloto, me gustaría hablar sobre un plan a medida.\n\nAlojamiento / gestor:\nVolumen aproximado de reservas:\n\nGracias.",
);
export const CONTACT_MAILTO = mailto("Contacto — Anclora SyncXML");

export const NAV_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Para quién es", href: "#para-quien-es" },
  { label: "Acceso piloto", href: "#acceso-piloto" },
  { label: "Seguridad y límites", href: "#seguridad" },
] as const;

export const HERO_BADGES = [
  { label: "Privacidad por defecto", icon: ShieldCheck },
  { label: "Datos enmascarados", icon: EyeOff },
  { label: "Revisión humana", icon: UserCheck },
  { label: "Piloto controlado", icon: Sparkles },
] as const;

export const HERO_FLOW = [
  { label: "Excel / XLSX", icon: FileSpreadsheet },
  { label: "Revisión", icon: SearchCheck },
  { label: "Errores", icon: AlertTriangle },
  { label: "XML revisable", icon: FileText },
] as const;

type Card = { title: string; text: string; icon: LucideIcon };

export const PROBLEM_CARDS: Card[] = [
  {
    title: "Datos incompletos",
    text: "Campos obligatorios que faltan y se detectan tarde, ya con la reserva encima.",
    icon: AlertTriangle,
  },
  {
    title: "Duplicados",
    text: "Mismos huéspedes repetidos entre hojas, exportaciones o reservas solapadas.",
    icon: Copy,
  },
  {
    title: "Errores en documentos y fechas",
    text: "Documentos, fechas o nacionalidades con formatos inconsistentes difíciles de revisar a mano.",
    icon: FileText,
  },
  {
    title: "Revisión manual lenta",
    text: "Revisar fila por fila en Excel consume tiempo y deja margen al error humano.",
    icon: Search,
  },
  {
    title: "Complejidad del XML",
    text: "Pasar de una hoja de cálculo a la estructura del XML no es trivial ni cómodo.",
    icon: Network,
  },
  {
    title: "Exposición de datos sensibles",
    text: "Documentos y contactos de huéspedes visibles en hojas que circulan sin control.",
    icon: EyeOff,
  },
];

export const SOLUTION_NOT = [
  "No es un PMS completo.",
  "No es una gestoría.",
  "No es asesoramiento legal.",
];

export const WORKFLOW_STEPS = [
  {
    title: "Importa tu Excel/XLSX",
    text: "Sube tu hoja de reservas y huéspedes con importación controlada del archivo.",
    icon: UploadCloud,
  },
  {
    title: "Revisa datos de reserva y huéspedes",
    text: "Visualiza los datos con campos sensibles enmascarados por defecto.",
    icon: SearchCheck,
  },
  {
    title: "Detecta errores o duplicados",
    text: "Identifica campos incompletos, formatos inconsistentes y registros repetidos.",
    icon: ListChecks,
  },
  {
    title: "Genera un XML revisable",
    text: "Prepara un XML orientado al flujo SES.HOSPEDAJES, listo para revisar.",
    icon: FileText,
  },
  {
    title: "Exporta con revisión humana",
    text: "Descarga o prepara el archivo tras una revisión humana explícita.",
    icon: UserCheck,
  },
];

export const ADVANTAGES: Card[] = [
  {
    title: "Herramienta ligera",
    text: "Diseñada como capa ligera frente a un PMS completo, sin procesos pesados.",
    icon: Sparkles,
  },
  {
    title: "Revisión previa",
    text: "Ayuda a revisar los datos antes de preparar el XML, no después.",
    icon: SearchCheck,
  },
  {
    title: "Detección de errores operativos",
    text: "Orientada a detectar incompletos, duplicados y formatos inconsistentes.",
    icon: ListChecks,
  },
  {
    title: "Datos sensibles enmascarados",
    text: "Documentos, contactos y pagos se muestran enmascarados por defecto.",
    icon: EyeOff,
  },
  {
    title: "Modo privado por defecto",
    text: "Documentado como modo privado sin almacenamiento permanente por defecto.",
    icon: ShieldCheck,
  },
  {
    title: "Auditoría técnica sin PII",
    text: "Trazabilidad operativa pensada para no registrar información personal.",
    icon: Fingerprint,
  },
  {
    title: "Para pequeños alojamientos",
    text: "Diseñada para viviendas turísticas y gestores con pocos inmuebles.",
    icon: Users,
  },
];

export type StatusBlock = {
  id: string;
  eyebrow: string;
  title: string;
  tone: "now" | "pending" | "future";
  items: string[];
};

export const STATUS_BLOCKS: StatusBlock[] = [
  {
    id: "now",
    eyebrow: "Hoy",
    title: "Disponible en validación controlada",
    tone: "now",
    items: [
      "Importación controlada de XLSX.",
      "Revisión de datos.",
      "Detección de duplicados.",
      "Generación de XML revisable.",
      "Vista previa con datos enmascarados.",
      "UI en español, inglés y alemán.",
      "Tema dark/light.",
    ],
  },
  {
    id: "pending",
    eyebrow: "Antes de claims fuertes",
    title: "Pendiente antes de afirmaciones fuertes",
    tone: "pending",
    items: [
      "Validación XSD estándar.",
      "Evidencia de aceptación SES en preproducción.",
      "Revisión legal.",
      "DPA (acuerdo de tratamiento de datos).",
      "Política formal de retención y borrado.",
      "QA E2E.",
      "Cierre de riesgos antes de datos reales.",
    ],
  },
  {
    id: "future",
    eyebrow: "Más adelante",
    title: "Evolución futura prevista",
    tone: "future",
    items: [
      "Mapeador visual de columnas.",
      "Pre-check-in.",
      "Mayor trazabilidad.",
      "Asistencia SES.",
      "Multipropiedad.",
      "Roles, API y B2B.",
    ],
  },
];

export const AUDIENCE_FOR = [
  "Pequeños alojamientos.",
  "Viviendas turísticas.",
  "Gestores con pocos inmuebles.",
  "Propietarios que trabajan con Excel.",
  "Quien busca una herramienta ligera.",
];

export const AUDIENCE_NOT_FOR = [
  "Cadenas hoteleras complejas.",
  "Operadores que necesitan un PMS integral.",
  "Quien exige integración SES automática desde el primer día.",
  "Negocios que no pueden trabajar con datos sintéticos o anonimizados en piloto.",
];

export type AccessTier = {
  id: string;
  icon: LucideIcon;
  title: string;
  text: string;
  itemsLabel: string;
  items: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaTrack: string;
  featured: boolean;
};

export const ACCESS_TIERS: AccessTier[] = [
  {
    id: "piloto",
    icon: ClipboardCheck,
    title: "Piloto controlado",
    text: "Probamos el flujo Excel/XLSX → revisión → detección de errores → XML revisable con datos sintéticos, anonimizados o muestras controladas.",
    itemsLabel: "Incluye",
    items: [
      "Importación de XLSX.",
      "Revisión de datos de reserva y huéspedes.",
      "Detección de incidencias.",
      "Generación de XML revisable de prueba.",
      "Sesión de cierre.",
      "Informe de límites y siguientes pasos.",
    ],
    ctaLabel: "Solicitar piloto controlado",
    ctaHref: PILOT_HREF,
    ctaTrack: "click_solicitar_piloto_controlado",
    featured: true,
  },
  {
    id: "waitlist",
    icon: Handshake,
    title: "Lista de espera",
    text: "Si el cupo del piloto no encaja todavía, registramos tu interés para una fase posterior sin prometer acceso inmediato.",
    itemsLabel: "Sirve para",
    items: [
      "Mantener contacto.",
      "Conocer tu tipo de alojamiento.",
      "Priorizar casos compatibles.",
      "Avisarte cuando se abra una fase adecuada.",
    ],
    ctaLabel: "Unirme a la lista de espera",
    ctaHref: PILOT_HREF,
    ctaTrack: "click_lista_espera",
    featured: false,
  },
];

export const TRUST_ITEMS: Card[] = [
  {
    title: "Minimización",
    text: "Trabaja con los datos necesarios para preparar y revisar el XML.",
    icon: ListChecks,
  },
  {
    title: "Enmascarado",
    text: "Documentos, contactos y pagos enmascarados por defecto en la vista previa.",
    icon: EyeOff,
  },
  {
    title: "Revisión humana",
    text: "La consolidación y exportación requieren revisión de una persona.",
    icon: UserCheck,
  },
  {
    title: "Auditoría técnica sin PII",
    text: "Trazabilidad operativa pensada para no registrar información personal.",
    icon: Fingerprint,
  },
  {
    title: "Datos sintéticos o anonimizados",
    text: "El piloto se plantea con datos sintéticos o anonimizados, no reales.",
    icon: ShieldCheck,
  },
  {
    title: "Límites legales claros",
    text: "Alcance documentado: no constituye asesoramiento legal.",
    icon: Ban,
  },
];

export const NO_PROMISE = [
  "No garantiza cumplimiento legal.",
  "No evita sanciones.",
  "No acredita aceptación automática por SES.HOSPEDAJES.",
  "No es integración oficial automática.",
  "No sustituye PMS, gestoría ni asesoría legal.",
  "No debe usarse con datos reales sin cerrar seguridad, privacidad, RGPD, retención y validación técnica.",
];

export const APP_MODAL_CHECKLIST = [
  "No debes subir datos reales de huéspedes.",
  "Debes usar solo datos sintéticos, anonimizados o muestras controladas.",
  "El XML generado es revisable, no oficialmente aceptado por SES.HOSPEDAJES.",
  "Anclora SyncXML no ofrece asesoramiento legal ni garantiza cumplimiento normativo.",
  "No hay integración oficial ni envío automático a SES.HOSPEDAJES.",
];
