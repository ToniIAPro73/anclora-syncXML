/**
 * Email template for pilot acceptance
 * Sent when a user is approved to join the controlled pilot
 */

interface PilotAcceptanceEmailProps {
  recipientName: string;
  pilotAccessUrl: string;
  demoExcelFile: string;
  quickStartGuideUrl: string;
  feedbackEmail: string;
  language?: "es" | "en" | "de";
}

const DISCLAIMERS = {
  es: `Durante esta fase, el piloto no realiza envíos oficiales ni envíos autónomos al entorno SES.HOSPEDAJES. Cualquier prueba técnica contra preproducción SES, si procede, será ejecutada únicamente por el responsable técnico de Anclora SyncXML con datos sintéticos o anonimizados.`,
  en: `During this phase, the pilot does not perform official submissions or autonomous submissions to the SES.HOSPEDAJES environment. Any technical test against SES pre-production, if applicable, will be executed only by the technical owner of Anclora SyncXML using synthetic or anonymized data.`,
  de: `In dieser Phase führt der Pilot keine offiziellen oder eigenständigen Übermittlungen an die SES.HOSPEDAJES-Umgebung durch. Technische Tests gegen die SES-Vorproduktionsumgebung werden, falls erforderlich, ausschließlich vom technischen Verantwortlichen von Anclora SyncXML mit synthetischen oder anonymisierten Daten durchgeführt.`,
};

const EMAIL_CONTENT = {
  es: {
    subject: "¡Bienvenido al piloto controlado de Anclora SyncXML!",
    greeting: (name: string) =>
      `¡Hola ${name}! 🎉`,
    intro: `Tu solicitud de piloto controlado ha sido **aceptada**. Estamos emocionados de que pruebes Anclora SyncXML en esta fase de validación.`,
    whatToTest: `
## ¿Qué puedo probar?

✓ Importar datos sintéticos
✓ Revisar y validar datos
✓ Generar XML descargable
✓ Proporcionar feedback
✗ NO puedes enviar XML a SES automáticamente
✗ NO uses datos reales
`,
    access: (url: string) => `
## Acceso a la aplicación

Entra aquí: **${url}**

El sistema solicitará confirmación antes de acceder (pre-MVP).
`,
    resources: (excelFile: string, guideUrl: string) => `
## Recursos incluidos

1. **${excelFile}** — Archivo Excel sintético de prueba (datos 100% ficticios)
2. **Guía rápida** — ${guideUrl}

Usa estos recursos para probar sin preparar tus propios datos.
`,
    steps: `
## Primeros pasos

1. Haz clic en el enlace de acceso arriba
2. Descarga el archivo Excel sintético
3. Importa el archivo en la aplicación
4. Genera y descarga el XML
5. Revisa el XML localmente

Cada paso tiene guía dentro de la aplicación.
`,
    feedback: (email: string) => `
## Envía feedback

¿Preguntas o sugerencias? Responde a este email o contacta: ${email}

- UX/experiencia
- Errores encontrados
- Sugerencias de mejora
- Aclaraciones necesarias

Todos los comentarios son valiosos en esta fase.
`,
    legal: DISCLAIMERS.es,
    closing: `¡Gracias por participar en el piloto!

El equipo de Anclora SyncXML`,
  },
  en: {
    subject: "Welcome to Anclora SyncXML Controlled Pilot!",
    greeting: (name: string) =>
      `Hi ${name}! 🎉`,
    intro: `Your controlled pilot request has been **approved**. We're excited for you to test Anclora SyncXML in this validation phase.`,
    whatToTest: `
## What can I test?

✓ Import synthetic data
✓ Review and validate data
✓ Generate downloadable XML
✓ Provide feedback
✗ CANNOT auto-submit XML to SES
✗ CANNOT use real data
`,
    access: (url: string) => `
## Application access

Open here: **${url}**

The system will request confirmation before access (pre-MVP).
`,
    resources: (excelFile: string, guideUrl: string) => `
## Included resources

1. **${excelFile}** — Synthetic test Excel file (100% fictitious data)
2. **Quick start guide** — ${guideUrl}

Use these resources to test without preparing your own data.
`,
    steps: `
## First steps

1. Click the access link above
2. Download the synthetic Excel file
3. Import the file in the application
4. Generate and download the XML
5. Review the XML locally

Each step has guidance within the application.
`,
    feedback: (email: string) => `
## Send feedback

Questions or suggestions? Reply to this email or contact: ${email}

- UX/experience
- Errors found
- Improvement suggestions
- Needed clarifications

All feedback is valuable in this phase.
`,
    legal: DISCLAIMERS.en,
    closing: `Thank you for participating in the pilot!

Anclora SyncXML team`,
  },
  de: {
    subject: "Willkommen beim kontrollierten Pilot von Anclora SyncXML!",
    greeting: (name: string) =>
      `Hallo ${name}! 🎉`,
    intro: `Ihre Anfrage für den kontrollierten Pilot wurde **genehmigt**. Wir freuen uns, dass Sie Anclora SyncXML in dieser Validierungsphase testen.`,
    whatToTest: `
## Was kann ich testen?

✓ Synthetische Daten importieren
✓ Daten überprüfen und validieren
✓ Herunterladbare XML generieren
✓ Feedback geben
✗ KANN XML NICHT automatisch an SES übermitteln
✗ KANN echte Daten NICHT verwenden
`,
    access: (url: string) => `
## Zugriff auf die Anwendung

Öffnen Sie hier: **${url}**

Das System fordert vor dem Zugriff Bestätigung an (Pre-MVP).
`,
    resources: (excelFile: string, guideUrl: string) => `
## Enthaltene Ressourcen

1. **${excelFile}** — Synthetische Test-Excel-Datei (100% fiktive Daten)
2. **Schnellstartanleitung** — ${guideUrl}

Verwenden Sie diese Ressourcen zum Testen, ohne Ihre eigenen Daten vorzubereiten.
`,
    steps: `
## Erste Schritte

1. Klicken Sie auf den Zugriffslink oben
2. Laden Sie die synthetische Excel-Datei herunter
3. Importieren Sie die Datei in der Anwendung
4. Generieren und laden Sie die XML herunter
5. Überprüfen Sie die XML lokal

Jeder Schritt hat eine Anleitung in der Anwendung.
`,
    feedback: (email: string) => `
## Senden Sie Feedback

Fragen oder Vorschläge? Antworten Sie auf diese E-Mail oder kontaktieren Sie: ${email}

- UX/Erfahrung
- Gefundene Fehler
- Verbesserungsvorschläge
- Erforderliche Klarstellungen

Alle Rückmeldungen sind wertvoll in dieser Phase.
`,
    legal: DISCLAIMERS.de,
    closing: `Vielen Dank, dass Sie am Pilot teilnehmen!

Anclora SyncXML Team`,
  },
};

export function generatePilotAcceptanceEmail(
  props: PilotAcceptanceEmailProps
): { subject: string; html: string; text: string } {
  const lang = props.language || "es";
  const content = EMAIL_CONTENT[lang];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .section { margin: 20px 0; }
    .section h2 { color: #1a1a2e; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
    .section ul { list-style: none; padding: 0; }
    .section li { padding: 5px 0; }
    .button { display: inline-block; background: #d4af37; color: #1a1a2e; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .disclaimer { background: #fff3cd; border-left: 4px solid #d4af37; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${content.greeting(props.recipientName)}</h1>
    </div>
    <div class="content">
      <p>${content.intro}</p>

      ${content.whatToTest.split("\n").map((line) => `<p>${line}</p>`).join("")}

      ${content.access(props.pilotAccessUrl).split("\n").map((line) => `<p>${line}</p>`).join("")}

      <a href="${props.pilotAccessUrl}" class="button">→ Acceder a la aplicación</a>

      ${content.resources(props.demoExcelFile, props.quickStartGuideUrl).split("\n").map((line) => `<p>${line}</p>`).join("")}

      ${content.steps.split("\n").map((line) => `<p>${line}</p>`).join("")}

      ${content.feedback(props.feedbackEmail).split("\n").map((line) => `<p>${line}</p>`).join("")}

      <div class="disclaimer">
        <strong>⚠️ Importante / Important / Wichtig</strong>
        <p>${content.legal}</p>
      </div>

      <p>${content.closing}</p>
    </div>
    <div class="footer">
      <p>Anclora SyncXML © 2026 — Fase Pre-MVP / Pre-MVP Phase / Pre-MVP Phase</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
${content.greeting(props.recipientName)}

${content.intro}

${content.whatToTest}

${content.access(props.pilotAccessUrl)}

Access: ${props.pilotAccessUrl}

${content.resources(props.demoExcelFile, props.quickStartGuideUrl)}

${content.steps}

${content.feedback(props.feedbackEmail)}

⚠️ DISCLAIMER:
${content.legal}

${content.closing}

---
Anclora SyncXML © 2026
  `.trim();

  return {
    subject: content.subject,
    html,
    text,
  };
}
