"use client";

import { ProductClassification } from "./ProductClassification";
import { usePreferences } from "./AppPreferencesProvider";

const content = {
  privacy: {
    es: {
      title: "Politica de privacidad de Anclora SyncXML",
      sections: [
        ["Datos tratados", "La aplicacion puede procesar datos de huespedes, documentos de identidad, fechas de nacimiento, nacionalidad, direcciones, telefonos, correos, datos de estancia, datos de pago limitados y metadatos contractuales incluidos por el usuario."],
        ["Finalidad", "Los datos se procesan para generar, validar, revisar y exportar XML bajo instruccion del usuario."],
        ["Modo sin persistencia", "Por defecto, Anclora SyncXML trabaja en modo privado sin almacenamiento permanente. Los datos temporales pueden eliminarse desde la accion de borrado de operacion."],
        ["Retencion", "No se conserva informacion personal de forma permanente salvo configuracion explicita de almacenamiento persistente por un administrador autorizado."],
        ["Seguridad", "El modelo aplica minimizacion, control de acceso, no logging de PII y separacion entre metadatos tecnicos y contenido personal. Si se habilita persistencia, deben aplicarse cifrado y politicas de retencion."],
        ["Responsabilidad del usuario", "El usuario debe tener legitimacion o autorizacion para importar los datos y debe revisar el resultado antes de cualquier uso oficial."],
        ["Derechos y contacto", "Para solicitudes de privacidad o contacto legal, use el canal legal designado por Anclora Group o configure un contacto legal antes de produccion."],
        ["Limitacion", "La herramienta no presta asesoramiento legal ni garantiza por si sola el cumplimiento normativo."],
      ],
    },
    en: {
      title: "Anclora SyncXML Privacy Policy",
      sections: [
        ["Data processed", "The application may process guest data, identity documents, birth dates, nationality, addresses, phone numbers, emails, stay data, limited payment data and contractual metadata provided by the user."],
        ["Purpose", "Data is processed to generate, validate, review and export XML under the user's instruction."],
        ["No-storage mode", "By default, Anclora SyncXML runs in private no-storage mode. Temporary data can be deleted with the operation clear action."],
        ["Retention", "Personal information is not kept permanently unless persistent storage is explicitly configured by an authorised administrator."],
        ["Security", "The model applies minimisation, access control, no PII logging and separation of technical metadata from personal content. If persistence is enabled, encryption and retention policies must be applied."],
        ["User responsibility", "The user must have a legitimate basis or authorisation to import the data and must review the result before any official use."],
        ["Rights and contact", "For privacy requests or legal contact, use Anclora Group's designated legal channel or configure a legal contact before production."],
        ["Limitation", "The tool does not provide legal advice and does not by itself guarantee regulatory compliance."],
      ],
    },
    de: {
      title: "Datenschutzerklaerung fuer Anclora SyncXML",
      sections: [
        ["Verarbeitete Daten", "Die Anwendung kann Gaestedaten, Ausweisdokumente, Geburtsdaten, Nationalitaet, Adressen, Telefonnummern, E-Mails, Aufenthaltsdaten, begrenzte Zahlungsdaten und Vertragsmetadaten verarbeiten, die der Nutzer bereitstellt."],
        ["Zweck", "Die Daten werden zur Erstellung, Validierung, Pruefung und zum Export von XML nach Anweisung des Nutzers verarbeitet."],
        ["Modus ohne Speicherung", "Standardmaessig arbeitet Anclora SyncXML im privaten Modus ohne dauerhafte Speicherung. Temporaere Daten koennen ueber die Aktion zum Loeschen des Vorgangs entfernt werden."],
        ["Aufbewahrung", "Personenbezogene Informationen werden nicht dauerhaft aufbewahrt, sofern ein autorisierter Administrator keine persistente Speicherung ausdruecklich konfiguriert."],
        ["Sicherheit", "Das Modell nutzt Minimierung, Zugriffskontrolle, kein Logging von PII und Trennung technischer Metadaten von personenbezogenen Inhalten. Bei aktivierter Persistenz muessen Verschluesselung und Aufbewahrungsregeln angewendet werden."],
        ["Verantwortung des Nutzers", "Der Nutzer muss eine Rechtsgrundlage oder Berechtigung fuer den Import der Daten haben und das Ergebnis vor offizieller Verwendung pruefen."],
        ["Rechte und Kontakt", "Fuer Datenschutzanfragen oder Rechtskontakt ist der vorgesehene Rechtskanal der Anclora Group zu nutzen oder vor Produktion zu konfigurieren."],
        ["Begrenzung", "Das Tool bietet keine Rechtsberatung und garantiert fuer sich allein keine regulatorische Konformitaet."],
      ],
    },
  },
  terms: {
    es: {
      title: "Terminos de uso de Anclora SyncXML",
      sections: [
        ["Objeto", "Anclora SyncXML ayuda a preparar, validar, revisar y exportar XML a partir de datos de reservas y huespedes."],
        ["Uso permitido", "Puede usarse para operaciones internas autorizadas, revision humana y exportacion controlada."],
        ["Uso prohibido", "No deben cargarse archivos sin autorizacion, datos innecesarios, datos excesivos o informacion de pago sensible no requerida."],
        ["Responsabilidad", "El usuario responde de la legitimidad de los datos importados y de la revision previa a consolidar o exportar."],
        ["Limitacion de responsabilidad", "La herramienta se ofrece en validacion controlada y no sustituye procesos legales, tecnicos u organizativos propios del usuario."],
        ["Tratamiento de datos", "El modo por defecto es privado sin almacenamiento permanente. La persistencia requiere configuracion expresa."],
        ["Revision humana", "Toda consolidacion y XML exportado debe revisarse por una persona antes de uso oficial o comunicacion a terceros."],
        ["Cambios", "La aplicacion puede actualizar validaciones, seguridad, textos y flujo durante la fase pre-MVP."],
      ],
    },
    en: {
      title: "Anclora SyncXML Terms of Use",
      sections: [
        ["Purpose", "Anclora SyncXML helps prepare, validate, review and export XML from booking and guest data."],
        ["Permitted use", "It may be used for authorised internal operations, human review and controlled export."],
        ["Prohibited use", "Files must not be uploaded without authorisation, with unnecessary data, excessive data or non-required sensitive payment information."],
        ["Responsibility", "The user is responsible for the legitimacy of imported data and for reviewing it before consolidation or export."],
        ["Liability limitation", "The tool is provided in controlled validation and does not replace the user's own legal, technical or organisational processes."],
        ["Data processing", "The default mode is private with no permanent storage. Persistence requires explicit configuration."],
        ["Human review", "Every consolidation and exported XML must be reviewed by a person before official use or third-party submission."],
        ["Changes", "The application may update validations, security, texts and workflow during the pre-MVP stage."],
      ],
    },
    de: {
      title: "Nutzungsbedingungen fuer Anclora SyncXML",
      sections: [
        ["Zweck", "Anclora SyncXML unterstuetzt die Vorbereitung, Validierung, Pruefung und den XML-Export aus Buchungs- und Gaestedaten."],
        ["Erlaubte Nutzung", "Die Nutzung ist fuer autorisierte interne Vorgange, menschliche Pruefung und kontrollierten Export vorgesehen."],
        ["Verbotene Nutzung", "Dateien duerfen nicht ohne Berechtigung, mit unnoetigen Daten, uebermaessigen Daten oder nicht erforderlichen sensiblen Zahlungsinformationen hochgeladen werden."],
        ["Verantwortung", "Der Nutzer ist fuer die Rechtmaessigkeit der importierten Daten und die Pruefung vor Konsolidierung oder Export verantwortlich."],
        ["Haftungsbegrenzung", "Das Tool befindet sich in kontrollierter Validierung und ersetzt keine eigenen rechtlichen, technischen oder organisatorischen Prozesse des Nutzers."],
        ["Datenverarbeitung", "Der Standardmodus ist privat ohne dauerhafte Speicherung. Persistenz erfordert ausdrueckliche Konfiguration."],
        ["Menschliche Pruefung", "Jede Konsolidierung und exportierte XML-Datei muss vor offizieller Nutzung oder Uebermittlung an Dritte von einer Person geprueft werden."],
        ["Aenderungen", "Die Anwendung kann Validierungen, Sicherheit, Texte und Ablauf waehrend der Pre-MVP-Phase aktualisieren."],
      ],
    },
  },
} as const;

export function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const { language } = usePreferences();
  const page = content[type][language];
  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="font-heading text-3xl font-black">{page.title}</h1>
        <div className="mt-6 grid gap-4">
          {page.sections.map(([title, copy]) => (
            <section key={title} className="rounded-lg border border-app bg-surface-elevated p-4">
              <h2 className="font-heading text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-secondary">{copy}</p>
            </section>
          ))}
        </div>
      </section>
      <ProductClassification />
    </div>
  );
}
