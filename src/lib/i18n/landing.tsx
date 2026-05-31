"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const LANDING_LOCALES = ["es", "en", "de"] as const;
export const DEFAULT_LANDING_LOCALE = "es";
export const LANDING_LOCALE_STORAGE_KEY = "anclora-syncxml-landing-locale";

export type LandingLocale = (typeof LANDING_LOCALES)[number];

export const LANDING_LOCALE_META: Record<LandingLocale, { short: string; nativeName: string; englishName: string }> = {
  es: { short: "ES", nativeName: "Español", englishName: "Spanish" },
  en: { short: "EN", nativeName: "English", englishName: "English" },
  de: { short: "DE", nativeName: "Deutsch", englishName: "German" },
};

type CardCopy = { title: string; text: string };
type StatusCopy = { id: string; eyebrow: string; title: string; items: string[] };
type AccessTierCopy = {
  id: string;
  title: string;
  text: string;
  itemsLabel: string;
  items: string[];
  ctaLabel: string;
  featured: boolean;
};
type LegalPageCopy = { title: string; eyebrow: string; intro: string; back: string; sections: [string, string][] };

export type LandingCopy = {
  meta: { title: string; description: string };
  aria: {
    home: string;
    logoAlt: string;
    sections: string;
    mobileMenu: string;
    languageTrigger: string;
    languageExpanded: string;
    currentLanguage: string;
    selectLanguage: Record<LandingLocale, string>;
    sectionNav: string;
    previousSection: string;
    nextSection: string;
    cookieButton: string;
    close: string;
  };
  nav: { product: string; how: string; audience: string; access: string; security: string };
  common: { pilotCta: string; waitlistCta: string; backLanding: string; privacy: string; terms: string; legal: string; cookies: string };
  hero: {
    eyebrow: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    lead: string;
    note: string;
    cardSubtitle: string;
    flowLabel: string;
  };
  flow: string[];
  problem: { eyebrow: string; title: string; intro: string; cards: CardCopy[] };
  solution: { eyebrow: string; title: string; intro: string; fitLabel: string; fitCopy: string; clearLabel: string; not: string[]; yes: string };
  workflow: { eyebrow: string; title: string; intro: string; steps: CardCopy[] };
  advantages: { eyebrow: string; title: string; intro: string; cards: CardCopy[] };
  status: { eyebrow: string; title: string; intro: string; blocks: StatusCopy[] };
  audience: { eyebrow: string; title: string; intro: string; forTitle: string; notForTitle: string; forItems: string[]; notForItems: string[] };
  access: { eyebrow: string; title: string; intro: string; recommended: string; tiers: AccessTierCopy[]; priceNote: string };
  appAvailable: { eyebrow: string; title: string; intro: string; important: string; note: string };
  trust: { eyebrow: string; title: string; intro: string; cards: CardCopy[]; privacyCta: string; termsCta: string };
  noPromise: { eyebrow: string; title: string; intro: string; items: string[] };
  finalCta: { eyebrow: string; title: string; intro: string; note: string };
  footer: { description: string; productLabel: string; legalLabel: string; languageNote: string; disclaimer: string; copyright: string };
  cookies: {
    bannerLabel: string;
    bannerText: string;
    privacyLink: string;
    configure: string;
    reject: string;
    accept: string;
    panelTitle: string;
    save: string;
    necessary: string;
    necessaryDesc: string;
    preferences: string;
    preferencesDesc: string;
    analytics: string;
    analyticsDesc: string;
    alwaysOn: string;
    page: LegalPageCopy;
  };
  pilotPage: { eyebrow: string; title: string; intro: string };
  form: {
    back: string;
    identity: string;
    operations: string;
    payment: string;
    fields: Record<"name" | "email" | "companyName" | "role", { label: string; placeholder?: string }>;
    accommodationLabel: string;
    propertyLabel: string;
    reservationsLabel: string;
    excelLabel: string;
    painLabel: string;
    painPlaceholder: string;
    workflowLabel: string;
    workflowPlaceholder: string;
    validateLabel: string;
    syntheticConsent: string;
    payLabel: string;
    modelLabel: string;
    budgetLabel: string;
    messageLabel: string;
    termsPrefix: string;
    termsMiddle: string;
    termsSuffix: string;
    submit: string;
    submitting: string;
    submitNote: string;
    submitError: string;
    successTitle: string;
    successCopy: string;
    successEmail: string;
    accommodationOptions: string[];
    propertyOptions: string[];
    reservationOptions: string[];
    excelOptions: string[];
    payOptions: string[];
    modelOptions: string[];
  };
  login: {
    metaTitle: string;
    metaDescription: string;
    backAria: string;
    title: string;
    badge: string;
    description: string;
    footerPrefix: string;
    footerMiddle: string;
    active: string;
    continue: string;
    logout: string;
    loggingOut: string;
    email: string;
    password: string;
    credentialHelp: string;
    configErrorDev: string;
    configError: string;
    invalid: string;
    actionError: string;
    checking: string;
    enter: string;
    notPilot: string;
    pilotNote: string;
  };
  legal: { privacy: LegalPageCopy; terms: LegalPageCopy };
};

const dictionaries: Record<LandingLocale, LandingCopy> = {
  es: {
    meta: {
      title: "Anclora SyncXML — Revisión de huéspedes desde Excel a XML revisable",
      description: "Herramienta ligera para revisar datos de huéspedes desde Excel/XLSX y generar XML revisable orientado al flujo SES.HOSPEDAJES, con privacidad por defecto y validación controlada.",
    },
    aria: {
      home: "Anclora SyncXML — inicio",
      logoAlt: "Logotipo de Anclora SyncXML",
      sections: "Secciones",
      mobileMenu: "Abrir menú de navegación",
      languageTrigger: "Cambiar idioma",
      languageExpanded: "Selector de idioma",
      currentLanguage: "Idioma actual: Español",
      selectLanguage: { es: "Seleccionar español", en: "Seleccionar inglés", de: "Seleccionar alemán" },
      sectionNav: "Navegación por secciones",
      previousSection: "Ir a la sección anterior",
      nextSection: "Ir a la sección siguiente",
      cookieButton: "Abrir preferencias de cookies",
      close: "Cerrar",
    },
    nav: { product: "Producto", how: "Cómo funciona", audience: "Para quién es", access: "Acceso piloto", security: "Seguridad y límites" },
    common: { pilotCta: "Solicitar piloto controlado", waitlistCta: "Unirme a la lista de espera", backLanding: "Volver a la landing", privacy: "privacidad", terms: "términos", legal: "Aviso legal", cookies: "Cookies" },
    hero: {
      eyebrow: "Piloto controlado",
      titleBefore: "De Excel a",
      titleHighlight: "XML revisable",
      titleAfter: "sin fricción.",
      lead: "Valida el flujo Excel/XLSX → revisión → XML con datos sintéticos o anonimizados. Sin envío automático a SES.HOSPEDAJES ni promesa de cumplimiento legal definitivo.",
      note: "Validación inicial con datos sintéticos o anonimizados. Sin envío automático a SES.HOSPEDAJES.",
      cardSubtitle: "Capa de revisión Excel → XML",
      flowLabel: "Flujo de revisión",
    },
    flow: ["Excel / XLSX", "Revisión", "Errores", "XML revisable"],
    problem: {
      eyebrow: "El problema",
      title: "Cuando el flujo depende de Excel, revisar datos de huéspedes puede volverse lento y delicado",
      intro: "Las hojas de cálculo son flexibles, pero revisar a mano cada reserva antes de preparar un XML deja margen al error y expone datos sensibles.",
      cards: [
        { title: "Datos incompletos", text: "Campos obligatorios que faltan y se detectan tarde, ya con la reserva encima." },
        { title: "Duplicados", text: "Mismos huéspedes repetidos entre hojas, exportaciones o reservas solapadas." },
        { title: "Errores en documentos y fechas", text: "Documentos, fechas o nacionalidades con formatos inconsistentes difíciles de revisar a mano." },
        { title: "Revisión manual lenta", text: "Revisar fila por fila en Excel consume tiempo y deja margen al error humano." },
        { title: "Complejidad del XML", text: "Pasar de una hoja de cálculo a la estructura del XML no es trivial ni cómodo." },
        { title: "Exposición de datos sensibles", text: "Documentos y contactos de huéspedes visibles en hojas que circulan sin control." },
      ],
    },
    solution: {
      eyebrow: "La solución",
      title: "Una capa ligera entre tu Excel y un XML revisable",
      intro: "Anclora SyncXML no sustituye tus herramientas: se sitúa entre tu hoja de cálculo y el XML, ayudando a revisar y preparar los datos.",
      fitLabel: "Cómo encaja",
      fitCopy: "Una capa especializada de revisión, preparación y generación de XML revisable orientada al flujo SES.HOSPEDAJES, con revisión humana antes de cualquier uso oficial.",
      clearLabel: "Para que quede claro",
      not: ["No es un PMS completo.", "No es una gestoría.", "No es asesoramiento legal."],
      yes: "Es una capa especializada de revisión, preparación y generación de XML revisable.",
    },
    workflow: {
      eyebrow: "Cómo funciona",
      title: "De la hoja de cálculo al XML revisable en cinco pasos",
      intro: "Un recorrido lineal y legible, pensado para revisar antes de generar.",
      steps: [
        { title: "Importa tu Excel/XLSX", text: "Sube tu hoja de reservas y huéspedes con importación controlada del archivo." },
        { title: "Revisa datos de reserva y huéspedes", text: "Visualiza los datos con campos sensibles enmascarados por defecto." },
        { title: "Detecta errores o duplicados", text: "Identifica campos incompletos, formatos inconsistentes y registros repetidos." },
        { title: "Genera un XML revisable", text: "Prepara un XML orientado al flujo SES.HOSPEDAJES, listo para revisar." },
        { title: "Exporta con revisión humana", text: "Descarga o prepara el archivo tras una revisión humana explícita." },
      ],
    },
    advantages: {
      eyebrow: "Ventajas actuales",
      title: "Más control antes de preparar el XML",
      intro: "Capacidades documentadas como disponibles en validación controlada, descritas con prudencia.",
      cards: [
        { title: "Herramienta ligera", text: "Diseñada como capa ligera frente a un PMS completo, sin procesos pesados." },
        { title: "Revisión previa", text: "Ayuda a revisar los datos antes de preparar el XML, no después." },
        { title: "Detección de errores operativos", text: "Orientada a detectar incompletos, duplicados y formatos inconsistentes." },
        { title: "Datos sensibles enmascarados", text: "Documentos, contactos y pagos se muestran enmascarados por defecto." },
        { title: "Modo privado por defecto", text: "Documentado como modo privado sin almacenamiento permanente por defecto." },
        { title: "Auditoría técnica sin PII", text: "Trazabilidad operativa pensada para no registrar información personal." },
        { title: "Para pequeños alojamientos", text: "Diseñada para viviendas turísticas y gestores con pocos inmuebles." },
      ],
    },
    status: {
      eyebrow: "Estado actual y evolución prevista",
      title: "Qué hay hoy, qué falta y qué vendrá — sin mezclarlo",
      intro: "Separamos de forma explícita lo disponible en validación controlada de lo pendiente y lo futuro.",
      blocks: [
        { id: "now", eyebrow: "Hoy", title: "Disponible en validación controlada", items: ["Importación controlada de XLSX.", "Revisión de datos.", "Detección de duplicados.", "Generación de XML revisable.", "Vista previa con datos enmascarados.", "Landing en español, inglés y alemán.", "Tema dark/light en la aplicación."] },
        { id: "pending", eyebrow: "Antes de claims fuertes", title: "Pendiente antes de afirmaciones fuertes", items: ["Validación XSD estándar.", "Evidencia de aceptación SES en preproducción.", "Revisión legal.", "DPA (acuerdo de tratamiento de datos).", "Política formal de retención y borrado.", "QA E2E.", "Cierre de riesgos antes de datos reales."] },
        { id: "future", eyebrow: "Más adelante", title: "Evolución futura prevista", items: ["Mapeador visual de columnas.", "Pre-check-in.", "Mayor trazabilidad.", "Asistencia SES.", "Multipropiedad.", "Roles, API y B2B."] },
      ],
    },
    audience: {
      eyebrow: "Encaje",
      title: "Para quién es y para quién no es",
      intro: "Honestidad sobre el encaje desde el principio, para no generar falsas expectativas.",
      forTitle: "Para quién es",
      notForTitle: "Para quién no es",
      forItems: ["Pequeños alojamientos.", "Viviendas turísticas.", "Gestores con pocos inmuebles.", "Propietarios que trabajan con Excel.", "Quien busca una herramienta ligera."],
      notForItems: ["Cadenas hoteleras complejas.", "Operadores que necesitan un PMS integral.", "Quien exige integración SES automática desde el primer día.", "Negocios que no pueden trabajar con datos sintéticos o anonimizados en piloto."],
    },
    access: {
      eyebrow: "Acceso piloto",
      title: "Acceso mediante piloto controlado",
      intro: "Anclora SyncXML todavía no se ofrece como plan SaaS cerrado. En esta fase trabajamos caso a caso para validar el encaje del producto, el flujo Excel/XLSX y la disposición de pago.",
      recommended: "Recomendado",
      tiers: [
        { id: "piloto", title: "Piloto controlado", text: "Probamos el flujo Excel/XLSX → revisión → detección de errores → XML revisable con datos sintéticos, anonimizados o muestras controladas.", itemsLabel: "Incluye", items: ["Importación de XLSX.", "Revisión de datos de reserva y huéspedes.", "Detección de incidencias.", "Generación de XML revisable de prueba.", "Sesión de cierre.", "Informe de límites y siguientes pasos."], ctaLabel: "Solicitar piloto controlado", featured: true },
        { id: "waitlist", title: "Lista de espera", text: "Si el cupo del piloto no encaja todavía, registramos tu interés para una fase posterior sin prometer acceso inmediato.", itemsLabel: "Sirve para", items: ["Mantener contacto.", "Conocer tu tipo de alojamiento.", "Priorizar casos compatibles.", "Avisarte cuando se abra una fase adecuada."], ctaLabel: "Unirme a la lista de espera", featured: false },
      ],
      priceNote: "No mostramos precios cerrados todavía. El precio se define tras el diagnóstico inicial, según el alcance del Excel/XLSX, el nivel de acompañamiento y las condiciones necesarias para un piloto seguro.",
    },
    appAvailable: {
      eyebrow: "Validación controlada",
      title: "Aplicación disponible para participantes del piloto",
      intro: "La aplicación funcional existe y se explora dentro del piloto controlado, con acceso aprobado de forma manual. Su objetivo actual es mostrar el flujo de trabajo y validar el producto con datos sintéticos o anonimizados.",
      important: "Importante: no subas datos reales de huéspedes. El XML generado es revisable y no implica aceptación oficial por SES.HOSPEDAJES ni garantía legal de cumplimiento.",
      note: "Acceso aprobado manualmente. Solo datos sintéticos o anonimizados.",
    },
    trust: {
      eyebrow: "Confianza y privacidad",
      title: "Prudencia operativa desde el diseño",
      intro: "La privacidad no es una capa añadida: orienta cómo se tratan y muestran los datos en cada paso.",
      cards: [
        { title: "Minimización", text: "Trabaja con los datos necesarios para preparar y revisar el XML." },
        { title: "Enmascarado", text: "Documentos, contactos y pagos enmascarados por defecto en la vista previa." },
        { title: "Revisión humana", text: "La consolidación y exportación requieren revisión de una persona." },
        { title: "Auditoría técnica sin PII", text: "Trazabilidad operativa pensada para no registrar información personal." },
        { title: "Datos sintéticos o anonimizados", text: "El piloto se plantea con datos sintéticos o anonimizados, no reales." },
        { title: "Límites legales claros", text: "Alcance documentado: no constituye asesoramiento legal." },
      ],
      privacyCta: "Política de privacidad",
      termsCta: "Términos de uso",
    },
    noPromise: {
      eyebrow: "Límites del piloto",
      title: "Qué no promete Anclora SyncXML",
      intro: "La validación controlada exige ser precisos: el producto ayuda a revisar y preparar, pero no sustituye obligaciones legales ni procesos propios.",
      items: ["No garantiza cumplimiento legal.", "No evita sanciones.", "No acredita aceptación automática por SES.HOSPEDAJES.", "No es integración oficial automática.", "No sustituye PMS, gestoría ni asesoría legal.", "No debe usarse con datos reales sin cerrar seguridad, privacidad, RGPD, retención y validación técnica."],
    },
    finalCta: {
      eyebrow: "Piloto controlado",
      title: "¿Tu alojamiento trabaja con Excel y necesitas revisar mejor los datos de huéspedes?",
      intro: "Podemos preparar una demo o piloto controlado con datos sintéticos o anonimizados para comprobar si Anclora SyncXML encaja en tu flujo actual.",
      note: "El piloto se plantea siempre con datos sintéticos o anonimizados. No debe usarse con datos reales sin cerrar seguridad, privacidad, RGPD, retención y validación técnica.",
    },
    footer: {
      description: "Capa ligera para revisar datos de huéspedes desde Excel/XLSX y preparar un XML revisable orientado al flujo SES.HOSPEDAJES.",
      productLabel: "Producto",
      legalLabel: "Legal",
      languageNote: "La landing está disponible en español, inglés y alemán. La aplicación puede ofrecer idiomas adicionales dentro del piloto según configuración.",
      disclaimer: "Anclora SyncXML está en fase pre-MVP / validación controlada. Ayuda a revisar datos y preparar XML revisable, pero no constituye asesoramiento legal, no garantiza cumplimiento normativo y no acredita integración oficial con SES.HOSPEDAJES. El uso con datos reales requiere cerrar previamente seguridad, RGPD, DPA, retención y validación técnica.",
      copyright: "© 2026 Anclora Group — Todos los derechos reservados. Anclora SyncXML forma parte del ecosistema operativo de Anclora Group.",
    },
    cookies: {
      bannerLabel: "Aviso de cookies",
      bannerText: "Usamos cookies necesarias para el funcionamiento del sitio y, con tu permiso, cookies de preferencias y analítica para mejorar la experiencia. Consulta la",
      privacyLink: "política de privacidad",
      configure: "Configurar",
      reject: "Rechazar opcionales",
      accept: "Aceptar todas",
      panelTitle: "Preferencias de cookies",
      save: "Guardar preferencias",
      necessary: "Necesarias",
      necessaryDesc: "Imprescindibles para la sesión, la seguridad y el funcionamiento básico. No pueden desactivarse.",
      preferences: "Preferencias",
      preferencesDesc: "Recuerdan tu tema e idioma entre sesiones. Si las desactivas, deberás reconfigurarlos.",
      analytics: "Analítica",
      analyticsDesc: "Nos ayudan a entender el uso del sitio de forma agregada. No se activa ninguna herramienta sin tu consentimiento.",
      alwaysOn: "Siempre activas",
      page: {
        eyebrow: "Cookies",
        title: "Preferencias de cookies",
        intro: "Actualmente usamos cookies técnicas necesarias para seguridad, sesión y funcionamiento del piloto. Si incorporamos analítica, preferencias persistentes o marketing, solicitaremos consentimiento previo desde el panel de preferencias.",
        back: "Volver a Anclora SyncXML",
        sections: [["Panel de preferencias", "Puedes reabrir las preferencias en cualquier momento desde el botón flotante o desde el enlace Cookies del footer."]],
      },
    },
    pilotPage: {
      eyebrow: "Programa de validación controlada",
      title: "Solicitar piloto controlado",
      intro: "Cuéntanos cómo trabajas hoy con Excel/XLSX. Con esta información valoramos el encaje del piloto. No incluyas datos reales de huéspedes: la validación se hace con datos sintéticos o anonimizados.",
    },
    form: {
      back: "Volver a la landing",
      identity: "Tus datos",
      operations: "Tu operativa",
      payment: "Disposición de pago",
      fields: { name: { label: "Nombre y apellidos" }, email: { label: "Email principal" }, companyName: { label: "Empresa o alojamiento", placeholder: "Opcional" }, role: { label: "Rol", placeholder: "Propietario, gestor, recepción…" } },
      accommodationLabel: "Tipo de alojamiento",
      propertyLabel: "Nº de inmuebles",
      reservationsLabel: "Reservas al mes (aprox.)",
      excelLabel: "¿Trabajas con Excel/XLSX?",
      painLabel: "Principal problema operativo",
      painPlaceholder: "¿Qué te cuesta más al revisar datos de huéspedes?",
      workflowLabel: "Flujo actual",
      workflowPlaceholder: "Excel, PMS, hoja de cálculo, gestoría, manual…",
      validateLabel: "Qué quieres validar en el piloto",
      syntheticConsent: "Puedo aportar una muestra sintética o anonimizada (sin datos reales de huéspedes).",
      payLabel: "¿Te interesa un piloto de pago?",
      modelLabel: "Modelo que preferirías",
      budgetLabel: "Rango orientativo o presupuesto (opcional)",
      messageLabel: "Mensaje (opcional)",
      termsPrefix: "He leído y acepto la",
      termsMiddle: "y los",
      termsSuffix: "Entiendo que el acceso es limitado, revocable y revisable; no subiré datos reales de huéspedes ni usaré el piloto para envíos oficiales.",
      submit: "Enviar solicitud de piloto",
      submitting: "Enviando solicitud…",
      submitNote: "Enviar no concede acceso automático: revisamos el encaje antes de habilitar la aplicación. La solicitud se gestiona de forma manual por email.",
      submitError: "No se pudo enviar la solicitud. Inténtalo de nuevo o escribe al correo de contacto.",
      successTitle: "Solicitud preparada",
      successCopy: "Solicitud recibida. Revisaremos el encaje del piloto antes de conceder acceso. No subas datos reales de huéspedes hasta que el piloto esté aprobado y configurado.",
      successEmail: "También puedes escribirnos a",
      accommodationOptions: ["Vivienda turística", "Pequeño hotel", "Pensión / hostal", "Gestor de alojamientos", "Otro"],
      propertyOptions: ["1–2 inmuebles", "3–10 inmuebles", "11–30 inmuebles", "Más de 30"],
      reservationOptions: ["Menos de 10", "10–30", "31–80", "Más de 80"],
      excelOptions: ["Sí", "A veces", "No"],
      payOptions: ["Sí, me interesa", "Quizá, según resultado", "Aún no lo sé", "No por ahora"],
      modelOptions: ["Pago único", "Cuota mensual", "Setup + mensual", "Por reserva", "Servicio a medida"],
    },
    login: {
      metaTitle: "Iniciar sesión — Anclora SyncXML",
      metaDescription: "Acceso autorizado a Anclora SyncXML en validación controlada. La participación en el piloto se concede tras revisión manual de la solicitud.",
      backAria: "Volver a la landing",
      title: "Iniciar sesión",
      badge: "PILOTO CONTROLADO",
      description: "Acceso reservado a participantes aprobados del piloto controlado. Iniciar sesión no concede acceso por sí mismo: la participación se revisa manualmente antes de habilitar la aplicación.",
      footerPrefix: "Al acceder aceptas los",
      footerMiddle: "y la",
      active: "Tu sesión está activa.",
      continue: "Continuar a la aplicación",
      logout: "Cerrar sesión",
      loggingOut: "Cerrando sesión…",
      email: "Email autorizado",
      password: "Contraseña temporal",
      credentialHelp: "Recibirás credenciales individuales por correo si tu solicitud queda aprobada para el piloto controlado.",
      configErrorDev: "Configura SYNCXML_ADMIN_PASSWORD y SESSION_SECRET para probar el login, o usa SYNCXML_LOCAL_DEMO=true para demo local sin datos reales.",
      configError: "La configuración de acceso no está disponible. Contacta con el administrador.",
      invalid: "Acceso no aprobado o credenciales no válidas.",
      actionError: "No se pudo completar la acción. Inténtalo de nuevo.",
      checking: "Comprobando…",
      enter: "Entrar a la aplicación",
      notPilot: "¿Todavía no participas en el piloto?",
      pilotNote: "No subas datos reales de huéspedes. La validación se realiza con datos sintéticos o anonimizados.",
    },
    legal: {
      privacy: {
        eyebrow: "Privacidad",
        title: "Política de privacidad de Anclora SyncXML",
        intro: "Resumen prudente para la fase de validación controlada. No sustituye una revisión legal antes de producción.",
        back: "Volver a Anclora SyncXML",
        sections: [
          ["Datos tratados", "La aplicación puede procesar datos de huéspedes, documentos de identidad, fechas de nacimiento, nacionalidad, direcciones, teléfonos, correos, datos de estancia, datos de pago limitados y metadatos contractuales incluidos por el usuario."],
          ["Finalidad", "Los datos se procesan para generar, validar, revisar y exportar XML bajo instrucción del usuario."],
          ["Modo sin persistencia", "Por defecto, Anclora SyncXML trabaja en modo privado sin almacenamiento permanente. Los datos temporales pueden eliminarse desde la acción de borrado de operación."],
          ["Limitación", "La herramienta no presta asesoramiento legal ni garantiza por sí sola el cumplimiento normativo."],
        ],
      },
      terms: {
        eyebrow: "Términos",
        title: "Términos de uso de Anclora SyncXML",
        intro: "Condiciones de uso para una herramienta en piloto controlado y con revisión humana.",
        back: "Volver a Anclora SyncXML",
        sections: [
          ["Objeto", "Anclora SyncXML ayuda a preparar, validar, revisar y exportar XML a partir de datos de reservas y huéspedes."],
          ["Uso permitido", "Puede usarse para operaciones internas autorizadas, revisión humana y exportación controlada."],
          ["Responsabilidad", "El usuario responde de la legitimidad de los datos importados y de la revisión previa a consolidar o exportar."],
          ["Revisión humana", "Toda consolidación y XML exportado debe revisarse por una persona antes de uso oficial o comunicación a terceros."],
        ],
      },
    },
  },
  en: {
    meta: {
      title: "Anclora SyncXML — Review guest data from Excel to reviewable XML",
      description: "A lightweight tool to review guest data from Excel/XLSX and prepare reviewable XML for the SES.HOSPEDAJES workflow, with privacy by default and controlled validation.",
    },
    aria: {
      home: "Anclora SyncXML — home",
      logoAlt: "Anclora SyncXML logo",
      sections: "Sections",
      mobileMenu: "Open navigation menu",
      languageTrigger: "Change language",
      languageExpanded: "Language selector",
      currentLanguage: "Current language: English",
      selectLanguage: { es: "Select Spanish", en: "Select English", de: "Select German" },
      sectionNav: "Section navigation",
      previousSection: "Go to previous section",
      nextSection: "Go to next section",
      cookieButton: "Open cookie preferences",
      close: "Close",
    },
    nav: { product: "Product", how: "How it works", audience: "Who it is for", access: "Pilot access", security: "Security and limits" },
    common: { pilotCta: "Request controlled pilot", waitlistCta: "Join the waitlist", backLanding: "Back to landing", privacy: "privacy policy", terms: "terms", legal: "Legal notice", cookies: "Cookies" },
    hero: {
      eyebrow: "Controlled pilot",
      titleBefore: "From Excel to",
      titleHighlight: "reviewable XML",
      titleAfter: "without friction.",
      lead: "Validate the Excel/XLSX → review → XML flow with synthetic or anonymized data. No automatic submission to SES.HOSPEDAJES and no promise of definitive legal compliance.",
      note: "Initial validation with synthetic or anonymized data. No automatic submission to SES.HOSPEDAJES.",
      cardSubtitle: "Excel → XML review layer",
      flowLabel: "Review flow",
    },
    flow: ["Excel / XLSX", "Review", "Issues", "Reviewable XML"],
    problem: {
      eyebrow: "The problem",
      title: "When the workflow depends on Excel, reviewing guest data can become slow and sensitive",
      intro: "Spreadsheets are flexible, but manually checking each booking before preparing XML leaves room for errors and exposes sensitive data.",
      cards: [
        { title: "Incomplete data", text: "Required fields are missing and often detected late, when the booking is already close." },
        { title: "Duplicates", text: "The same guests appear across sheets, exports or overlapping bookings." },
        { title: "Document and date issues", text: "Documents, dates or nationalities use inconsistent formats that are hard to review manually." },
        { title: "Slow manual review", text: "Checking Excel row by row takes time and leaves space for human error." },
        { title: "XML complexity", text: "Moving from a spreadsheet to the XML structure is not trivial or comfortable." },
        { title: "Sensitive data exposure", text: "Guest documents and contact details stay visible in sheets that may circulate without control." },
      ],
    },
    solution: {
      eyebrow: "The solution",
      title: "A lightweight layer between your Excel and a reviewable XML",
      intro: "Anclora SyncXML does not replace your tools: it sits between your spreadsheet and the XML, helping you review and prepare the data.",
      fitLabel: "How it fits",
      fitCopy: "A specialized layer for review, preparation and generation of reviewable XML for the SES.HOSPEDAJES workflow, with human review before any official use.",
      clearLabel: "To be clear",
      not: ["It is not a complete PMS.", "It is not an agency service.", "It is not legal advice."],
      yes: "It is a specialized layer for reviewing, preparing and generating reviewable XML.",
    },
    workflow: {
      eyebrow: "How it works",
      title: "From spreadsheet to reviewable XML in five steps",
      intro: "A linear, readable path designed for review before generation.",
      steps: [
        { title: "Import your Excel/XLSX", text: "Upload your bookings and guests spreadsheet through controlled file import." },
        { title: "Review booking and guest data", text: "View the data with sensitive fields masked by default." },
        { title: "Detect errors or duplicates", text: "Identify incomplete fields, inconsistent formats and repeated records." },
        { title: "Generate reviewable XML", text: "Prepare XML oriented to the SES.HOSPEDAJES flow, ready for review." },
        { title: "Export after human review", text: "Download or prepare the file after explicit human review." },
      ],
    },
    advantages: {
      eyebrow: "Current advantages",
      title: "More control before preparing XML",
      intro: "Capabilities documented as available in controlled validation, described with prudence.",
      cards: [
        { title: "Lightweight tool", text: "Designed as a light layer rather than a full PMS, without heavy processes." },
        { title: "Pre-review", text: "Helps review data before preparing XML, not afterwards." },
        { title: "Operational issue detection", text: "Focused on incomplete fields, duplicates and inconsistent formats." },
        { title: "Masked sensitive data", text: "Documents, contact details and payments are masked by default." },
        { title: "Private mode by default", text: "Documented as private mode with no permanent storage by default." },
        { title: "Technical audit without PII", text: "Operational traceability designed not to log personal information." },
        { title: "For small accommodation operators", text: "Designed for holiday rentals and managers with a small property base." },
      ],
    },
    status: {
      eyebrow: "Current status and planned evolution",
      title: "What exists today, what is pending and what comes later",
      intro: "We explicitly separate what is available in controlled validation from pending and future work.",
      blocks: [
        { id: "now", eyebrow: "Today", title: "Available in controlled validation", items: ["Controlled XLSX import.", "Data review.", "Duplicate detection.", "Reviewable XML generation.", "Preview with masked data.", "Landing in Spanish, English and German.", "Dark/light theme in the app."] },
        { id: "pending", eyebrow: "Before stronger claims", title: "Pending before stronger statements", items: ["Standard XSD validation.", "Evidence of SES acceptance in preproduction.", "Legal review.", "DPA (data processing agreement).", "Formal retention and deletion policy.", "E2E QA.", "Risk closure before real data."] },
        { id: "future", eyebrow: "Later", title: "Planned future evolution", items: ["Visual column mapper.", "Pre-check-in.", "Deeper traceability.", "SES assistance.", "Multi-property support.", "Roles, API and B2B."] },
      ],
    },
    audience: {
      eyebrow: "Fit",
      title: "Who it is for and who it is not for",
      intro: "Clear fit criteria from the start, so expectations stay realistic.",
      forTitle: "Who it is for",
      notForTitle: "Who it is not for",
      forItems: ["Small accommodation operators.", "Holiday rentals.", "Managers with a small property base.", "Owners working with Excel.", "Teams looking for a lightweight tool."],
      notForItems: ["Complex hotel chains.", "Operators that need a full PMS.", "Teams requiring automatic SES integration from day one.", "Businesses that cannot run a pilot with synthetic or anonymized data."],
    },
    access: {
      eyebrow: "Pilot access",
      title: "Access through a controlled pilot",
      intro: "Anclora SyncXML is not offered as a finished SaaS plan yet. At this stage we work case by case to validate product fit, the Excel/XLSX flow and willingness to pay.",
      recommended: "Recommended",
      tiers: [
        { id: "piloto", title: "Controlled pilot", text: "We test the Excel/XLSX → review → issue detection → reviewable XML flow with synthetic, anonymized or controlled samples.", itemsLabel: "Includes", items: ["XLSX import.", "Booking and guest data review.", "Issue detection.", "Test reviewable XML generation.", "Closing session.", "Limits and next-steps report."], ctaLabel: "Request controlled pilot", featured: true },
        { id: "waitlist", title: "Waitlist", text: "If the current pilot capacity is not a fit yet, we record your interest for a later phase without promising immediate access.", itemsLabel: "Useful for", items: ["Keeping in touch.", "Understanding your accommodation type.", "Prioritizing compatible cases.", "Notifying you when a suitable phase opens."], ctaLabel: "Join the waitlist", featured: false },
      ],
      priceNote: "We do not show fixed prices yet. Pricing is defined after the initial diagnosis, based on the Excel/XLSX scope, support level and conditions needed for a safe pilot.",
    },
    appAvailable: {
      eyebrow: "Controlled validation",
      title: "Application available for pilot participants",
      intro: "The functional application exists and is explored inside the controlled pilot, with manually approved access. Its current goal is to show the workflow and validate the product with synthetic or anonymized data.",
      important: "Important: do not upload real guest data. The generated XML is reviewable and does not imply official acceptance by SES.HOSPEDAJES or a legal compliance guarantee.",
      note: "Manually approved access. Synthetic or anonymized data only.",
    },
    trust: {
      eyebrow: "Trust and privacy",
      title: "Operational prudence by design",
      intro: "Privacy is not an added layer: it guides how data is handled and displayed at each step.",
      cards: [
        { title: "Minimization", text: "Work with the data needed to prepare and review the XML." },
        { title: "Masking", text: "Documents, contact details and payments are masked by default in the preview." },
        { title: "Human review", text: "Consolidation and export require review by a person." },
        { title: "Technical audit without PII", text: "Operational traceability designed not to log personal information." },
        { title: "Synthetic or anonymized data", text: "The pilot is designed around synthetic or anonymized data, not real data." },
        { title: "Clear legal limits", text: "Documented scope: this is not legal advice." },
      ],
      privacyCta: "Privacy policy",
      termsCta: "Terms of use",
    },
    noPromise: {
      eyebrow: "Pilot limits",
      title: "What Anclora SyncXML does not promise",
      intro: "Controlled validation requires precision: the product helps review and prepare, but it does not replace legal obligations or your own processes.",
      items: ["It does not guarantee legal compliance.", "It does not prevent penalties.", "It does not certify automatic acceptance by SES.HOSPEDAJES.", "It is not an official automatic integration.", "It does not replace a PMS, agency service or legal advisor.", "It must not be used with real data before security, privacy, GDPR, retention and technical validation are closed."],
    },
    finalCta: {
      eyebrow: "Controlled pilot",
      title: "Does your accommodation business work with Excel and need better guest-data review?",
      intro: "We can prepare a demo or controlled pilot with synthetic or anonymized data to check whether Anclora SyncXML fits your current workflow.",
      note: "The pilot is always based on synthetic or anonymized data. It must not be used with real data before security, privacy, GDPR, retention and technical validation are closed.",
    },
    footer: {
      description: "A lightweight layer to review guest data from Excel/XLSX and prepare reviewable XML for the SES.HOSPEDAJES workflow.",
      productLabel: "Product",
      legalLabel: "Legal",
      languageNote: "This landing page is available in Spanish, English and German. The application may offer additional languages within the controlled pilot depending on configuration.",
      disclaimer: "Anclora SyncXML is in pre-MVP / controlled validation. It helps review data and prepare reviewable XML, but it is not legal advice, does not guarantee regulatory compliance and does not certify official integration with SES.HOSPEDAJES. Use with real data requires prior closure of security, GDPR, DPA, retention and technical validation.",
      copyright: "© 2026 Anclora Group — All rights reserved. Anclora SyncXML is part of the Anclora Group operating ecosystem.",
    },
    cookies: {
      bannerLabel: "Cookie notice",
      bannerText: "We use necessary cookies for site operation and, with your permission, preference and analytics cookies to improve the experience. See the",
      privacyLink: "privacy policy",
      configure: "Configure",
      reject: "Reject optional",
      accept: "Accept all",
      panelTitle: "Cookie preferences",
      save: "Save preferences",
      necessary: "Necessary",
      necessaryDesc: "Required for session, security and basic operation. They cannot be disabled.",
      preferences: "Preferences",
      preferencesDesc: "Remember your theme and language between sessions. If disabled, you will need to configure them again.",
      analytics: "Analytics",
      analyticsDesc: "Help us understand site usage in aggregate. No tool is enabled without your consent.",
      alwaysOn: "Always on",
      page: {
        eyebrow: "Cookies",
        title: "Cookie preferences",
        intro: "We currently use technical cookies required for security, session and pilot operation. If we add analytics, persistent preferences or marketing, we will request consent through the preferences panel.",
        back: "Back to Anclora SyncXML",
        sections: [["Preferences panel", "You can reopen preferences at any time from the floating button or the Cookies link in the footer."]],
      },
    },
    pilotPage: {
      eyebrow: "Controlled validation program",
      title: "Request controlled pilot",
      intro: "Tell us how you currently work with Excel/XLSX. This helps us assess pilot fit. Do not include real guest data: validation uses synthetic or anonymized data.",
    },
    form: {
      back: "Back to landing",
      identity: "Your details",
      operations: "Your operation",
      payment: "Payment readiness",
      fields: { name: { label: "Full name" }, email: { label: "Main email" }, companyName: { label: "Company or accommodation", placeholder: "Optional" }, role: { label: "Role", placeholder: "Owner, manager, reception…" } },
      accommodationLabel: "Accommodation type",
      propertyLabel: "Number of properties",
      reservationsLabel: "Bookings per month (approx.)",
      excelLabel: "Do you work with Excel/XLSX?",
      painLabel: "Main operational issue",
      painPlaceholder: "What is hardest when reviewing guest data?",
      workflowLabel: "Current workflow",
      workflowPlaceholder: "Excel, PMS, spreadsheet, agency, manual…",
      validateLabel: "What do you want to validate in the pilot?",
      syntheticConsent: "I can provide a synthetic or anonymized sample (with no real guest data).",
      payLabel: "Are you interested in a paid pilot?",
      modelLabel: "Preferred model",
      budgetLabel: "Indicative range or budget (optional)",
      messageLabel: "Message (optional)",
      termsPrefix: "I have read and accept the",
      termsMiddle: "and the",
      termsSuffix: "I understand that access is limited, revocable and reviewable; I will not upload real guest data or use the pilot for official submissions.",
      submit: "Send pilot request",
      submitting: "Sending request…",
      submitNote: "Submitting does not grant automatic access: we review fit before enabling the application. The request is handled manually by email.",
      submitError: "We could not send the request. Try again or write to the contact email.",
      successTitle: "Request prepared",
      successCopy: "Request received. We will review pilot fit before granting access. Do not upload real guest data until the pilot is approved and configured.",
      successEmail: "You can also write to us at",
      accommodationOptions: ["Holiday rental", "Small hotel", "Guesthouse / hostel", "Accommodation manager", "Other"],
      propertyOptions: ["1–2 properties", "3–10 properties", "11–30 properties", "More than 30"],
      reservationOptions: ["Fewer than 10", "10–30", "31–80", "More than 80"],
      excelOptions: ["Yes", "Sometimes", "No"],
      payOptions: ["Yes, I am interested", "Maybe, depending on results", "I do not know yet", "Not for now"],
      modelOptions: ["One-off payment", "Monthly fee", "Setup + monthly", "Per booking", "Tailored service"],
    },
    login: {
      metaTitle: "Sign in — Anclora SyncXML",
      metaDescription: "Authorized access to Anclora SyncXML in controlled validation. Pilot participation is granted after manual review of the request.",
      backAria: "Back to landing",
      title: "Sign in",
      badge: "CONTROLLED PILOT",
      description: "Access is reserved for approved controlled-pilot participants. Signing in does not grant access by itself: participation is manually reviewed before the application is enabled.",
      footerPrefix: "By accessing you accept the",
      footerMiddle: "and the",
      active: "Your session is active.",
      continue: "Continue to the application",
      logout: "Sign out",
      loggingOut: "Signing out…",
      email: "Authorized email",
      password: "Temporary password",
      credentialHelp: "You will receive individual credentials by email if your request is approved for the controlled pilot.",
      configErrorDev: "Set SYNCXML_ADMIN_PASSWORD and SESSION_SECRET to test login, or use SYNCXML_LOCAL_DEMO=true for a local demo without real data.",
      configError: "Access configuration is not available. Contact the administrator.",
      invalid: "Access not approved or credentials are invalid.",
      actionError: "The action could not be completed. Try again.",
      checking: "Checking…",
      enter: "Enter the application",
      notPilot: "Not part of the pilot yet?",
      pilotNote: "Do not upload real guest data. Validation uses synthetic or anonymized data.",
    },
    legal: {
      privacy: {
        eyebrow: "Privacy",
        title: "Anclora SyncXML Privacy Policy",
        intro: "Prudent summary for the controlled validation phase. It does not replace legal review before production.",
        back: "Back to Anclora SyncXML",
        sections: [
          ["Data processed", "The application may process guest data, identity documents, birth dates, nationality, addresses, phone numbers, emails, stay data, limited payment data and contractual metadata provided by the user."],
          ["Purpose", "Data is processed to generate, validate, review and export XML under the user's instruction."],
          ["No-storage mode", "By default, Anclora SyncXML runs in private no-storage mode. Temporary data can be deleted with the operation clear action."],
          ["Limitation", "The tool does not provide legal advice and does not by itself guarantee regulatory compliance."],
        ],
      },
      terms: {
        eyebrow: "Terms",
        title: "Anclora SyncXML Terms of Use",
        intro: "Terms for a controlled-pilot tool with human review.",
        back: "Back to Anclora SyncXML",
        sections: [
          ["Purpose", "Anclora SyncXML helps prepare, validate, review and export XML from booking and guest data."],
          ["Permitted use", "It may be used for authorized internal operations, human review and controlled export."],
          ["Responsibility", "The user is responsible for the legitimacy of imported data and for reviewing it before consolidation or export."],
          ["Human review", "Every consolidation and exported XML must be reviewed by a person before official use or third-party submission."],
        ],
      },
    },
  },
  de: {
    meta: {
      title: "Anclora SyncXML — Gästedaten aus Excel zu prüfbarem XML",
      description: "Ein schlankes Werkzeug zur Prüfung von Gästedaten aus Excel/XLSX und zur Vorbereitung prüfbarer XML-Dateien für den SES.HOSPEDAJES-Ablauf, mit Datenschutz als Standard und kontrollierter Validierung.",
    },
    aria: {
      home: "Anclora SyncXML — Startseite",
      logoAlt: "Logo von Anclora SyncXML",
      sections: "Abschnitte",
      mobileMenu: "Navigationsmenü öffnen",
      languageTrigger: "Sprache ändern",
      languageExpanded: "Sprachauswahl",
      currentLanguage: "Aktuelle Sprache: Deutsch",
      selectLanguage: { es: "Spanisch auswählen", en: "Englisch auswählen", de: "Deutsch auswählen" },
      sectionNav: "Abschnittsnavigation",
      previousSection: "Zum vorherigen Abschnitt",
      nextSection: "Zum nächsten Abschnitt",
      cookieButton: "Cookie-Einstellungen öffnen",
      close: "Schließen",
    },
    nav: { product: "Produkt", how: "So funktioniert es", audience: "Für wen", access: "Pilotzugang", security: "Sicherheit und Grenzen" },
    common: { pilotCta: "Kontrollierten Pilot anfragen", waitlistCta: "Zur Warteliste", backLanding: "Zurück zur Landingpage", privacy: "Datenschutz", terms: "Bedingungen", legal: "Impressum", cookies: "Cookies" },
    hero: {
      eyebrow: "Kontrollierter Pilotbetrieb",
      titleBefore: "Von Excel zu",
      titleHighlight: "prüfbarem XML",
      titleAfter: "ohne Reibung.",
      lead: "Validiere den Ablauf Excel/XLSX → Prüfung → XML mit synthetischen oder anonymisierten Daten. Keine automatische Übermittlung an SES.HOSPEDAJES und keine Zusage endgültiger Rechtssicherheit.",
      note: "Erste Validierung mit synthetischen oder anonymisierten Daten. Keine automatische Übermittlung an SES.HOSPEDAJES.",
      cardSubtitle: "Prüfschicht Excel → XML",
      flowLabel: "Prüfablauf",
    },
    flow: ["Excel / XLSX", "Prüfung", "Fehler", "Prüfbares XML"],
    problem: {
      eyebrow: "Das Problem",
      title: "Wenn der Ablauf von Excel abhängt, kann die Prüfung von Gästedaten langsam und sensibel werden",
      intro: "Tabellen sind flexibel, doch jede Buchung vor der XML-Erstellung manuell zu prüfen, lässt Raum für Fehler und legt sensible Daten offen.",
      cards: [
        { title: "Unvollständige Daten", text: "Pflichtfelder fehlen und werden oft spät erkannt, wenn die Buchung bereits ansteht." },
        { title: "Duplikate", text: "Dieselben Gäste erscheinen in mehreren Tabellen, Exporten oder überlappenden Buchungen." },
        { title: "Dokument- und Datumsfehler", text: "Dokumente, Daten oder Nationalitäten haben uneinheitliche Formate und sind manuell schwer zu prüfen." },
        { title: "Langsame manuelle Prüfung", text: "Zeile für Zeile in Excel zu prüfen kostet Zeit und lässt Spielraum für menschliche Fehler." },
        { title: "XML-Komplexität", text: "Der Weg von der Tabelle zur XML-Struktur ist weder trivial noch komfortabel." },
        { title: "Sichtbare sensible Daten", text: "Dokumente und Kontaktdaten von Gästen bleiben in Tabellen sichtbar, die unkontrolliert weitergegeben werden können." },
      ],
    },
    solution: {
      eyebrow: "Die Lösung",
      title: "Eine schlanke Schicht zwischen Excel und prüfbarem XML",
      intro: "Anclora SyncXML ersetzt deine Werkzeuge nicht: Es sitzt zwischen Tabelle und XML und hilft, Daten zu prüfen und vorzubereiten.",
      fitLabel: "So passt es",
      fitCopy: "Eine spezialisierte Schicht für Prüfung, Vorbereitung und Erstellung prüfbarer XML-Dateien für den SES.HOSPEDAJES-Ablauf, mit menschlicher Prüfung vor jeder offiziellen Nutzung.",
      clearLabel: "Zur Klarstellung",
      not: ["Es ist kein vollständiges PMS.", "Es ist kein Verwaltungs- oder Agenturservice.", "Es ist keine Rechtsberatung."],
      yes: "Es ist eine spezialisierte Schicht zur Prüfung, Vorbereitung und Erstellung prüfbarer XML-Dateien.",
    },
    workflow: {
      eyebrow: "So funktioniert es",
      title: "Von der Tabelle zu prüfbarem XML in fünf Schritten",
      intro: "Ein linearer, gut lesbarer Ablauf, der auf Prüfung vor der Erstellung ausgelegt ist.",
      steps: [
        { title: "Excel/XLSX importieren", text: "Lade deine Tabelle mit Buchungen und Gästen über einen kontrollierten Dateiimport hoch." },
        { title: "Buchungs- und Gästedaten prüfen", text: "Sieh die Daten mit standardmäßig maskierten sensiblen Feldern." },
        { title: "Fehler oder Duplikate erkennen", text: "Erkenne unvollständige Felder, uneinheitliche Formate und wiederholte Datensätze." },
        { title: "Prüfbares XML erzeugen", text: "Bereite XML für den SES.HOSPEDAJES-Ablauf vor, bereit zur Prüfung." },
        { title: "Nach menschlicher Prüfung exportieren", text: "Lade die Datei erst nach ausdrücklicher menschlicher Prüfung herunter oder bereite sie vor." },
      ],
    },
    advantages: {
      eyebrow: "Aktuelle Vorteile",
      title: "Mehr Kontrolle vor der XML-Vorbereitung",
      intro: "Funktionen, die in kontrollierter Validierung verfügbar sind und bewusst vorsichtig beschrieben werden.",
      cards: [
        { title: "Schlankes Werkzeug", text: "Als leichte Schicht statt vollständigem PMS konzipiert, ohne schwere Prozesse." },
        { title: "Vorprüfung", text: "Hilft, Daten vor der XML-Vorbereitung zu prüfen, nicht erst danach." },
        { title: "Erkennung operativer Fehler", text: "Fokussiert auf unvollständige Felder, Duplikate und uneinheitliche Formate." },
        { title: "Maskierte sensible Daten", text: "Dokumente, Kontaktdaten und Zahlungen werden standardmäßig maskiert." },
        { title: "Privater Modus als Standard", text: "Als privater Modus ohne dauerhafte Speicherung standardmäßig dokumentiert." },
        { title: "Technisches Audit ohne PII", text: "Operative Nachvollziehbarkeit, die keine personenbezogenen Informationen protokollieren soll." },
        { title: "Für kleine Unterkunftsbetriebe", text: "Für Ferienwohnungen und Verwalter mit wenigen Objekten konzipiert." },
      ],
    },
    status: {
      eyebrow: "Aktueller Stand und geplante Entwicklung",
      title: "Was heute vorhanden ist, was fehlt und was später kommt",
      intro: "Wir trennen klar, was im kontrollierten Pilotbetrieb verfügbar ist, was noch aussteht und was später geplant ist.",
      blocks: [
        { id: "now", eyebrow: "Heute", title: "In kontrollierter Validierung verfügbar", items: ["Kontrollierter XLSX-Import.", "Datenprüfung.", "Duplikaterkennung.", "Erstellung prüfbarer XML-Dateien.", "Vorschau mit maskierten Daten.", "Landingpage auf Spanisch, Englisch und Deutsch.", "Dark-/Light-Theme in der Anwendung."] },
        { id: "pending", eyebrow: "Vor stärkeren Aussagen", title: "Ausstehend vor stärkeren Claims", items: ["Standard-XSD-Validierung.", "Nachweis der SES-Akzeptanz in Vorproduktion.", "Rechtliche Prüfung.", "DPA (Auftragsverarbeitungsvertrag).", "Formale Aufbewahrungs- und Löschrichtlinie.", "E2E-QA.", "Risikoklärung vor echten Daten."] },
        { id: "future", eyebrow: "Später", title: "Geplante Weiterentwicklung", items: ["Visueller Spaltenmapper.", "Pre-Check-in.", "Mehr Nachvollziehbarkeit.", "SES-Unterstützung.", "Mehrere Objekte.", "Rollen, API und B2B."] },
      ],
    },
    audience: {
      eyebrow: "Passung",
      title: "Für wen es gedacht ist und für wen nicht",
      intro: "Klare Einordnung von Anfang an, damit keine falschen Erwartungen entstehen.",
      forTitle: "Für wen es gedacht ist",
      notForTitle: "Für wen nicht",
      forItems: ["Kleine Unterkunftsbetriebe.", "Ferienwohnungen.", "Verwalter mit wenigen Objekten.", "Eigentümer, die mit Excel arbeiten.", "Teams, die ein schlankes Werkzeug suchen."],
      notForItems: ["Komplexe Hotelketten.", "Betreiber, die ein vollständiges PMS benötigen.", "Teams, die ab dem ersten Tag automatische SES-Integration verlangen.", "Unternehmen, die keinen Pilotbetrieb mit synthetischen oder anonymisierten Daten durchführen können."],
    },
    access: {
      eyebrow: "Pilotzugang",
      title: "Zugang über kontrollierten Pilotbetrieb",
      intro: "Anclora SyncXML wird noch nicht als fertiger SaaS-Plan angeboten. In dieser Phase arbeiten wir fallweise, um Produktpassung, Excel/XLSX-Ablauf und Zahlungsbereitschaft zu validieren.",
      recommended: "Empfohlen",
      tiers: [
        { id: "piloto", title: "Kontrollierter Pilot", text: "Wir testen den Ablauf Excel/XLSX → Prüfung → Fehlererkennung → prüfbares XML mit synthetischen, anonymisierten oder kontrollierten Beispielen.", itemsLabel: "Enthält", items: ["XLSX-Import.", "Prüfung von Buchungs- und Gästedaten.", "Erkennung von Auffälligkeiten.", "Erstellung eines prüfbaren Test-XML.", "Abschlusssitzung.", "Bericht zu Grenzen und nächsten Schritten."], ctaLabel: "Kontrollierten Pilot anfragen", featured: true },
        { id: "waitlist", title: "Warteliste", text: "Wenn die aktuelle Pilotkapazität noch nicht passt, erfassen wir dein Interesse für eine spätere Phase, ohne sofortigen Zugang zu versprechen.", itemsLabel: "Dient dazu", items: ["Kontakt zu halten.", "Deine Unterkunftsart zu verstehen.", "Passende Fälle zu priorisieren.", "Dich über eine geeignete Phase zu informieren."], ctaLabel: "Zur Warteliste", featured: false },
      ],
      priceNote: "Wir zeigen noch keine festen Preise. Der Preis wird nach der ersten Diagnose festgelegt, abhängig vom Excel/XLSX-Umfang, dem Begleitungsniveau und den Bedingungen für einen sicheren Pilotbetrieb.",
    },
    appAvailable: {
      eyebrow: "Kontrollierte Validierung",
      title: "Anwendung für Pilotteilnehmer verfügbar",
      intro: "Die funktionale Anwendung existiert und wird im kontrollierten Pilotbetrieb genutzt, mit manuell freigegebenem Zugang. Ziel ist es aktuell, den Arbeitsablauf zu zeigen und das Produkt mit synthetischen oder anonymisierten Daten zu validieren.",
      important: "Wichtig: Lade keine echten Gästedaten hoch. Das erzeugte XML ist prüfbar und bedeutet weder offizielle Annahme durch SES.HOSPEDAJES noch eine Garantie rechtlicher Konformität.",
      note: "Manuell freigegebener Zugang. Nur synthetische oder anonymisierte Daten.",
    },
    trust: {
      eyebrow: "Vertrauen und Datenschutz",
      title: "Operative Vorsicht im Design",
      intro: "Datenschutz ist keine Zusatzschicht: Er prägt, wie Daten in jedem Schritt behandelt und angezeigt werden.",
      cards: [
        { title: "Minimierung", text: "Arbeite mit den Daten, die zur Vorbereitung und Prüfung des XML nötig sind." },
        { title: "Maskierung", text: "Dokumente, Kontaktdaten und Zahlungen werden in der Vorschau standardmäßig maskiert." },
        { title: "Menschliche Prüfung", text: "Konsolidierung und Export erfordern die Prüfung durch eine Person." },
        { title: "Technisches Audit ohne PII", text: "Operative Nachvollziehbarkeit, die keine personenbezogenen Informationen protokollieren soll." },
        { title: "Synthetische oder anonymisierte Daten", text: "Der Pilotbetrieb ist auf synthetische oder anonymisierte Daten ausgelegt, nicht auf echte Daten." },
        { title: "Klare rechtliche Grenzen", text: "Dokumentierter Umfang: Es handelt sich nicht um Rechtsberatung." },
      ],
      privacyCta: "Datenschutz",
      termsCta: "Nutzungsbedingungen",
    },
    noPromise: {
      eyebrow: "Grenzen des Piloten",
      title: "Was Anclora SyncXML nicht verspricht",
      intro: "Kontrollierte Validierung verlangt Präzision: Das Produkt hilft bei Prüfung und Vorbereitung, ersetzt aber keine rechtlichen Pflichten oder eigenen Prozesse.",
      items: ["Es garantiert keine rechtliche Konformität.", "Es verhindert keine Sanktionen.", "Es bestätigt keine automatische Annahme durch SES.HOSPEDAJES.", "Es ist keine offizielle automatische Integration.", "Es ersetzt weder PMS noch Verwaltung noch Rechtsberatung.", "Es darf nicht mit echten Daten genutzt werden, bevor Sicherheit, Datenschutz, DSGVO, Aufbewahrung und technische Validierung geklärt sind."],
    },
    finalCta: {
      eyebrow: "Kontrollierter Pilotbetrieb",
      title: "Arbeitet dein Unterkunftsbetrieb mit Excel und braucht bessere Prüfung von Gästedaten?",
      intro: "Wir können eine Demo oder einen kontrollierten Pilotbetrieb mit synthetischen oder anonymisierten Daten vorbereiten, um zu prüfen, ob Anclora SyncXML zu deinem aktuellen Ablauf passt.",
      note: "Der Pilotbetrieb basiert immer auf synthetischen oder anonymisierten Daten. Er darf nicht mit echten Daten genutzt werden, bevor Sicherheit, Datenschutz, DSGVO, Aufbewahrung und technische Validierung geklärt sind.",
    },
    footer: {
      description: "Eine schlanke Schicht zur Prüfung von Gästedaten aus Excel/XLSX und zur Vorbereitung prüfbarer XML-Dateien für den SES.HOSPEDAJES-Ablauf.",
      productLabel: "Produkt",
      legalLabel: "Rechtliches",
      languageNote: "Diese Landingpage ist auf Spanisch, Englisch und Deutsch verfügbar. Die Anwendung kann im kontrollierten Pilotbetrieb je nach Konfiguration weitere Sprachen anbieten.",
      disclaimer: "Anclora SyncXML befindet sich in der Pre-MVP-Phase / kontrollierten Validierung. Es hilft bei der Prüfung von Daten und der Vorbereitung prüfbarer XML-Dateien, stellt aber keine Rechtsberatung dar, garantiert keine regulatorische Konformität und bestätigt keine offizielle Integration mit SES.HOSPEDAJES. Die Nutzung mit echten Daten erfordert zuvor geklärte Sicherheit, DSGVO, DPA, Aufbewahrung und technische Validierung.",
      copyright: "© 2026 Anclora Group — Alle Rechte vorbehalten. Anclora SyncXML ist Teil des operativen Ökosystems der Anclora Group.",
    },
    cookies: {
      bannerLabel: "Cookie-Hinweis",
      bannerText: "Wir verwenden notwendige Cookies für den Betrieb der Website und, mit deiner Erlaubnis, Präferenz- und Analyse-Cookies zur Verbesserung der Erfahrung. Siehe die",
      privacyLink: "Datenschutzerklärung",
      configure: "Konfigurieren",
      reject: "Optionale ablehnen",
      accept: "Alle akzeptieren",
      panelTitle: "Cookie-Einstellungen",
      save: "Einstellungen speichern",
      necessary: "Notwendig",
      necessaryDesc: "Erforderlich für Sitzung, Sicherheit und Grundfunktion. Sie können nicht deaktiviert werden.",
      preferences: "Präferenzen",
      preferencesDesc: "Speichern Theme und Sprache zwischen Sitzungen. Wenn deaktiviert, musst du sie erneut konfigurieren.",
      analytics: "Analyse",
      analyticsDesc: "Hilft uns, die Nutzung der Website aggregiert zu verstehen. Kein Tool wird ohne Zustimmung aktiviert.",
      alwaysOn: "Immer aktiv",
      page: {
        eyebrow: "Cookies",
        title: "Cookie-Einstellungen",
        intro: "Derzeit verwenden wir technische Cookies, die für Sicherheit, Sitzung und Pilotbetrieb erforderlich sind. Wenn wir Analyse, persistente Präferenzen oder Marketing hinzufügen, holen wir die Zustimmung über das Präferenzpanel ein.",
        back: "Zurück zu Anclora SyncXML",
        sections: [["Präferenzpanel", "Du kannst die Einstellungen jederzeit über den schwebenden Button oder den Cookies-Link im Footer erneut öffnen."]],
      },
    },
    pilotPage: {
      eyebrow: "Programm für kontrollierte Validierung",
      title: "Kontrollierten Pilot anfragen",
      intro: "Erzähle uns, wie du heute mit Excel/XLSX arbeitest. Damit bewerten wir die Passung des Piloten. Bitte keine echten Gästedaten einfügen: Die Validierung erfolgt mit synthetischen oder anonymisierten Daten.",
    },
    form: {
      back: "Zurück zur Landingpage",
      identity: "Deine Daten",
      operations: "Dein Betrieb",
      payment: "Zahlungsbereitschaft",
      fields: { name: { label: "Vor- und Nachname" }, email: { label: "Haupt-E-Mail" }, companyName: { label: "Unternehmen oder Unterkunft", placeholder: "Optional" }, role: { label: "Rolle", placeholder: "Eigentümer, Verwalter, Rezeption…" } },
      accommodationLabel: "Unterkunftsart",
      propertyLabel: "Anzahl Objekte",
      reservationsLabel: "Buchungen pro Monat (ca.)",
      excelLabel: "Arbeitest du mit Excel/XLSX?",
      painLabel: "Wichtigstes operatives Problem",
      painPlaceholder: "Was ist bei der Prüfung von Gästedaten am schwierigsten?",
      workflowLabel: "Aktueller Ablauf",
      workflowPlaceholder: "Excel, PMS, Tabelle, Verwaltung, manuell…",
      validateLabel: "Was möchtest du im Pilotbetrieb validieren?",
      syntheticConsent: "Ich kann ein synthetisches oder anonymisiertes Beispiel bereitstellen (ohne echte Gästedaten).",
      payLabel: "Interessierst du dich für einen bezahlten Pilotbetrieb?",
      modelLabel: "Bevorzugtes Modell",
      budgetLabel: "Orientierungsrahmen oder Budget (optional)",
      messageLabel: "Nachricht (optional)",
      termsPrefix: "Ich habe die",
      termsMiddle: "und die",
      termsSuffix: "gelesen und akzeptiere sie. Ich verstehe, dass der Zugang begrenzt, widerruflich und überprüfbar ist; ich werde keine echten Gästedaten hochladen und den Pilotbetrieb nicht für offizielle Übermittlungen nutzen.",
      submit: "Pilotanfrage senden",
      submitting: "Anfrage wird gesendet…",
      submitNote: "Das Senden gewährt keinen automatischen Zugang: Wir prüfen die Passung, bevor die Anwendung freigeschaltet wird. Die Anfrage wird manuell per E-Mail bearbeitet.",
      submitError: "Die Anfrage konnte nicht gesendet werden. Versuche es erneut oder schreibe an die Kontakt-E-Mail.",
      successTitle: "Anfrage vorbereitet",
      successCopy: "Anfrage erhalten. Wir prüfen die Passung des Piloten, bevor wir Zugang gewähren. Lade keine echten Gästedaten hoch, bis der Pilot genehmigt und konfiguriert ist.",
      successEmail: "Du kannst uns auch schreiben an",
      accommodationOptions: ["Ferienwohnung", "Kleines Hotel", "Pension / Hostal", "Unterkunftsverwalter", "Andere"],
      propertyOptions: ["1–2 Objekte", "3–10 Objekte", "11–30 Objekte", "Mehr als 30"],
      reservationOptions: ["Weniger als 10", "10–30", "31–80", "Mehr als 80"],
      excelOptions: ["Ja", "Manchmal", "Nein"],
      payOptions: ["Ja, ich bin interessiert", "Vielleicht, je nach Ergebnis", "Ich weiß es noch nicht", "Derzeit nicht"],
      modelOptions: ["Einmalzahlung", "Monatliche Gebühr", "Setup + monatlich", "Pro Buchung", "Individueller Service"],
    },
    login: {
      metaTitle: "Anmelden — Anclora SyncXML",
      metaDescription: "Autorisierter Zugang zu Anclora SyncXML in kontrollierter Validierung. Die Teilnahme am Pilotbetrieb wird nach manueller Prüfung der Anfrage gewährt.",
      backAria: "Zurück zur Landingpage",
      title: "Anmelden",
      badge: "KONTROLLIERTER PILOT",
      description: "Der Zugang ist für genehmigte Teilnehmer des kontrollierten Piloten reserviert. Die Anmeldung gewährt keinen Zugang von selbst: Die Teilnahme wird manuell geprüft, bevor die Anwendung aktiviert wird.",
      footerPrefix: "Mit dem Zugriff akzeptierst du die",
      footerMiddle: "und den",
      active: "Deine Sitzung ist aktiv.",
      continue: "Zur Anwendung",
      logout: "Abmelden",
      loggingOut: "Abmeldung läuft…",
      email: "Autorisierte E-Mail",
      password: "Temporäres Passwort",
      credentialHelp: "Du erhältst individuelle Zugangsdaten per E-Mail, wenn deine Anfrage für den kontrollierten Pilotbetrieb genehmigt wird.",
      configErrorDev: "Konfiguriere SYNCXML_ADMIN_PASSWORD und SESSION_SECRET zum Testen des Logins oder nutze SYNCXML_LOCAL_DEMO=true für eine lokale Demo ohne echte Daten.",
      configError: "Die Zugangskonfiguration ist nicht verfügbar. Kontaktiere den Administrator.",
      invalid: "Zugang nicht genehmigt oder Zugangsdaten ungültig.",
      actionError: "Die Aktion konnte nicht abgeschlossen werden. Versuche es erneut.",
      checking: "Prüfung läuft…",
      enter: "Zur Anwendung anmelden",
      notPilot: "Noch nicht im Pilotbetrieb?",
      pilotNote: "Lade keine echten Gästedaten hoch. Die Validierung erfolgt mit synthetischen oder anonymisierten Daten.",
    },
    legal: {
      privacy: {
        eyebrow: "Datenschutz",
        title: "Datenschutzerklärung für Anclora SyncXML",
        intro: "Vorsichtige Zusammenfassung für die Phase der kontrollierten Validierung. Sie ersetzt keine rechtliche Prüfung vor Produktion.",
        back: "Zurück zu Anclora SyncXML",
        sections: [
          ["Verarbeitete Daten", "Die Anwendung kann Gästedaten, Ausweisdokumente, Geburtsdaten, Nationalität, Adressen, Telefonnummern, E-Mails, Aufenthaltsdaten, begrenzte Zahlungsdaten und Vertragsmetadaten verarbeiten, die der Nutzer bereitstellt."],
          ["Zweck", "Die Daten werden zur Erstellung, Validierung, Prüfung und zum Export von XML nach Anweisung des Nutzers verarbeitet."],
          ["Modus ohne Speicherung", "Standardmäßig arbeitet Anclora SyncXML im privaten Modus ohne dauerhafte Speicherung. Temporäre Daten können über die Aktion zum Löschen des Vorgangs entfernt werden."],
          ["Begrenzung", "Das Tool bietet keine Rechtsberatung und garantiert für sich allein keine regulatorische Konformität."],
        ],
      },
      terms: {
        eyebrow: "Bedingungen",
        title: "Nutzungsbedingungen für Anclora SyncXML",
        intro: "Bedingungen für ein Werkzeug im kontrollierten Pilotbetrieb mit menschlicher Prüfung.",
        back: "Zurück zu Anclora SyncXML",
        sections: [
          ["Zweck", "Anclora SyncXML unterstützt die Vorbereitung, Validierung, Prüfung und den XML-Export aus Buchungs- und Gästedaten."],
          ["Erlaubte Nutzung", "Die Nutzung ist für autorisierte interne Vorgänge, menschliche Prüfung und kontrollierten Export vorgesehen."],
          ["Verantwortung", "Der Nutzer ist für die Rechtmäßigkeit der importierten Daten und die Prüfung vor Konsolidierung oder Export verantwortlich."],
          ["Menschliche Prüfung", "Jede Konsolidierung und exportierte XML-Datei muss vor offizieller Nutzung oder Übermittlung an Dritte von einer Person geprüft werden."],
        ],
      },
    },
  },
};

type LandingI18nContextValue = {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
  copy: LandingCopy;
};

const LandingI18nContext = createContext<LandingI18nContextValue | null>(null);

export function normalizeLandingLocale(value: unknown): LandingLocale | null {
  if (typeof value !== "string") return null;
  const base = value.trim().toLowerCase().split(/[-_]/)[0];
  return (LANDING_LOCALES as readonly string[]).includes(base) ? (base as LandingLocale) : null;
}

export function resolveInitialLandingLocale(input: {
  persistedLocale?: string | null;
  urlLocale?: string | null;
  browserLocales?: readonly string[];
}): LandingLocale {
  const persisted = normalizeLandingLocale(input.persistedLocale);
  if (persisted) return persisted;
  const url = normalizeLandingLocale(input.urlLocale);
  if (url) return url;
  for (const browserLocale of input.browserLocales || []) {
    const locale = normalizeLandingLocale(browserLocale);
    if (locale) return locale;
  }
  return DEFAULT_LANDING_LOCALE;
}

function getBrowserLocale(): LandingLocale {
  if (typeof window === "undefined") return DEFAULT_LANDING_LOCALE;
  return resolveInitialLandingLocale({
    persistedLocale: window.localStorage.getItem(LANDING_LOCALE_STORAGE_KEY),
    browserLocales: navigator.languages?.length ? navigator.languages : [navigator.language],
  });
}

export function LandingLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LandingLocale>(DEFAULT_LANDING_LOCALE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getBrowserLocale();
    setLocaleState(initial);
    document.documentElement.lang = initial;
    setMounted(true);
  }, []);

  const setLocale = (nextLocale: LandingLocale) => {
    setLocaleState(nextLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANDING_LOCALE_STORAGE_KEY, nextLocale);
      document.documentElement.lang = nextLocale;
    }
  };

  const value = useMemo<LandingI18nContextValue>(() => ({
    locale: mounted ? locale : DEFAULT_LANDING_LOCALE,
    setLocale,
    copy: dictionaries[mounted ? locale : DEFAULT_LANDING_LOCALE],
  }), [locale, mounted]);

  return <LandingI18nContext.Provider value={value}>{children}</LandingI18nContext.Provider>;
}

export function useLandingI18n(): LandingI18nContextValue {
  const context = useContext(LandingI18nContext);
  if (context) return context;
  return {
    locale: DEFAULT_LANDING_LOCALE,
    setLocale: () => undefined,
    copy: dictionaries[DEFAULT_LANDING_LOCALE],
  };
}

export function getLandingDictionary(locale: LandingLocale = DEFAULT_LANDING_LOCALE): LandingCopy {
  return dictionaries[locale];
}
