"use client";

import { ProductClassification } from "./ProductClassification";
import { usePreferences } from "./AppPreferencesProvider";
import { LandingLocaleProvider, useLandingI18n } from "@/lib/i18n/landing";

const content = {
  privacy: {
    es: {
      title: "Política de privacidad de Anclora SyncXML",
      sections: [
        ["Datos tratados", "La aplicación puede procesar datos de huéspedes, documentos de identidad, fechas de nacimiento, nacionalidad, direcciones, teléfonos, correos, datos de estancia, datos de pago limitados y metadatos contractuales incluidos por el usuario."],
        ["Finalidad", "Los datos se procesan para generar, validar, revisar y exportar XML bajo instrucción del usuario."],
        ["Modo sin persistencia", "Por defecto, Anclora SyncXML trabaja en modo privado sin almacenamiento permanente. Los datos temporales pueden eliminarse desde la acción de borrado de operación."],
        ["Retención", "No se conserva información personal de forma permanente salvo configuración explícita de almacenamiento persistente por un administrador autorizado."],
        ["Seguridad", "El modelo aplica minimización, control de acceso, no logging de PII y separación entre metadatos técnicos y contenido personal. Si se habilita persistencia, deben aplicarse cifrado y políticas de retención."],
        ["Responsabilidad del usuario", "El usuario debe tener legitimación o autorización para importar los datos y debe revisar el resultado antes de cualquier uso oficial."],
        ["Derechos y contacto", "Para solicitudes de privacidad o contacto legal, use el canal legal designado por Anclora Group o configure un contacto legal antes de producción."],
        ["Limitación", "La herramienta no presta asesoramiento legal ni garantiza por sí sola el cumplimiento normativo."],
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
    ca: {
      title: "Política de privacitat d'Anclora SyncXML",
      sections: [
        ["Dades tractades", "L'aplicació pot processar dades d'hostes, documents d'identitat, dates de naixement, nacionalitat, adreces, telèfons, correus, dades d'estada, dades de pagament limitades i metadades contractuals incloses per l'usuari."],
        ["Finalitat", "Les dades es processen per generar, validar, revisar i exportar XML sota instrucció de l'usuari."],
        ["Mode sense persistència", "Per defecte, Anclora SyncXML treballa en mode privat sense emmagatzematge permanent. Les dades temporals poden eliminar-se des de l'acció d'esborrat d'operació."],
        ["Retenció", "No es conserva informació personal de forma permanent tret de configuració explícita d'emmagatzematge persistent per un administrador autoritzat."],
        ["Seguretat", "El model aplica minimització, control d'accés, no logging de PII i separació entre metadades tècniques i contingut personal. Si s'habilita persistència, han d'aplicar-se xifrat i polítiques de retenció."],
        ["Responsabilitat de l'usuari", "L'usuari ha de tenir legitimació o autorització per importar les dades i ha de revisar el resultat abans de qualsevol ús oficial."],
        ["Drets i contacte", "Per a sol·licituds de privacitat o contacte legal, useu el canal legal designat per Anclora Group o configureu un contacte legal abans de producció."],
        ["Limitació", "L'eina no presta assessorament legal ni garanteix per si sola el compliment normatiu."],
      ],
    },
    fr: {
      title: "Politique de confidentialité d'Anclora SyncXML",
      sections: [
        ["Données traitées", "L'application peut traiter des données de clients, des documents d'identité, des dates de naissance, la nationalité, des adresses, des numéros de téléphone, des emails, des données de séjour, des données de paiement limitées et des métadonnées contractuelles fournies par l'utilisateur."],
        ["Finalité", "Les données sont traitées pour générer, valider, réviser et exporter du XML sous instruction de l'utilisateur."],
        ["Mode sans stockage", "Par défaut, Anclora SyncXML fonctionne en mode privé sans stockage permanent. Les données temporaires peuvent être supprimées via l'action d'effacement de l'opération."],
        ["Conservation", "Les informations personnelles ne sont pas conservées de façon permanente sauf configuration explicite du stockage persistant par un administrateur autorisé."],
        ["Sécurité", "Le modèle applique la minimisation, le contrôle d'accès, l'absence de journalisation des DCP et la séparation des métadonnées techniques du contenu personnel. Si la persistance est activée, le chiffrement et les politiques de conservation doivent être appliqués."],
        ["Responsabilité de l'utilisateur", "L'utilisateur doit disposer d'une base légitime ou d'une autorisation pour importer les données et doit vérifier le résultat avant tout usage officiel."],
        ["Droits et contact", "Pour les demandes relatives à la vie privée ou le contact juridique, utilisez le canal légal désigné par Anclora Group ou configurez un contact légal avant la mise en production."],
        ["Limitation", "L'outil ne fournit pas de conseil juridique et ne garantit pas à lui seul la conformité réglementaire."],
      ],
    },
    it: {
      title: "Informativa sulla privacy di Anclora SyncXML",
      sections: [
        ["Dati trattati", "L'applicazione può trattare dati degli ospiti, documenti d'identità, date di nascita, nazionalità, indirizzi, numeri di telefono, email, dati di soggiorno, dati di pagamento limitati e metadati contrattuali forniti dall'utente."],
        ["Finalità", "I dati vengono trattati per generare, validare, rivedere ed esportare file XML su istruzione dell'utente."],
        ["Modalità senza archiviazione", "Per impostazione predefinita, Anclora SyncXML funziona in modalità privata senza archiviazione permanente. I dati temporanei possono essere eliminati tramite l'azione di cancellazione dell'operazione."],
        ["Conservazione", "Le informazioni personali non vengono conservate in modo permanente salvo configurazione esplicita di archiviazione persistente da parte di un amministratore autorizzato."],
        ["Sicurezza", "Il modello applica la minimizzazione, il controllo degli accessi, l'assenza di registrazione di DPI e la separazione dei metadati tecnici dal contenuto personale. Se la persistenza è abilitata, devono essere applicati crittografia e politiche di conservazione."],
        ["Responsabilità dell'utente", "L'utente deve disporre di una base giuridica o di un'autorizzazione per importare i dati e deve verificare il risultato prima di qualsiasi uso ufficiale."],
        ["Diritti e contatto", "Per richieste relative alla privacy o per contatti legali, utilizzare il canale legale designato da Anclora Group o configurare un contatto legale prima della produzione."],
        ["Limitazione", "Lo strumento non fornisce consulenza legale e non garantisce da solo la conformità normativa."],
      ],
    },
    pt: {
      title: "Política de privacidade do Anclora SyncXML",
      sections: [
        ["Dados tratados", "A aplicação pode tratar dados de hóspedes, documentos de identidade, datas de nascimento, nacionalidade, moradas, números de telefone, emails, dados de estadia, dados de pagamento limitados e metadados contratuais fornecidos pelo utilizador."],
        ["Finalidade", "Os dados são tratados para gerar, validar, rever e exportar ficheiros XML sob instrução do utilizador."],
        ["Modo sem armazenamento", "Por defeito, Anclora SyncXML funciona em modo privado sem armazenamento permanente. Os dados temporários podem ser eliminados através da acção de limpeza da operação."],
        ["Retenção", "As informações pessoais não são conservadas de forma permanente salvo configuração explícita de armazenamento persistente por um administrador autorizado."],
        ["Segurança", "O modelo aplica minimização, controlo de acesso, ausência de registo de DDP e separação entre metadados técnicos e conteúdo pessoal. Se a persistência estiver activada, devem ser aplicados cifração e políticas de retenção."],
        ["Responsabilidade do utilizador", "O utilizador deve ter legitimação ou autorização para importar os dados e deve rever o resultado antes de qualquer utilização oficial."],
        ["Direitos e contacto", "Para pedidos de privacidade ou contacto legal, utilize o canal legal designado pelo Anclora Group ou configure um contacto legal antes da produção."],
        ["Limitação", "A ferramenta não presta aconselhamento jurídico nem garante por si só a conformidade regulatória."],
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
      title: "Términos de uso de Anclora SyncXML",
      sections: [
        ["Objeto", "Anclora SyncXML ayuda a preparar, validar, revisar y exportar XML a partir de datos de reservas y huéspedes."],
        ["Uso permitido", "Puede usarse para operaciones internas autorizadas, revisión humana y exportación controlada."],
        ["Uso prohibido", "No deben cargarse archivos sin autorización, datos innecesarios, datos excesivos o información de pago sensible no requerida."],
        ["Responsabilidad", "El usuario responde de la legitimidad de los datos importados y de la revisión previa a consolidar o exportar."],
        ["Limitación de responsabilidad", "La herramienta se ofrece en validación controlada y no sustituye procesos legales, técnicos u organizativos propios del usuario."],
        ["Tratamiento de datos", "El modo por defecto es privado sin almacenamiento permanente. La persistencia requiere configuración expresa."],
        ["Revisión humana", "Toda consolidación y XML exportado debe revisarse por una persona antes de uso oficial o comunicación a terceros."],
        ["Cambios", "La aplicación puede actualizar validaciones, seguridad, textos y flujo durante la fase pre-MVP."],
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
    ca: {
      title: "Termes d'ús d'Anclora SyncXML",
      sections: [
        ["Objecte", "Anclora SyncXML ajuda a preparar, validar, revisar i exportar XML a partir de dades de reserves i hostes."],
        ["Ús permès", "Pot usar-se per a operacions internes autoritzades, revisió humana i exportació controlada."],
        ["Ús prohibit", "No han de carregar-se fitxers sense autorització, dades innecessàries, dades excessives o informació de pagament sensible no requerida."],
        ["Responsabilitat", "L'usuari respon de la legitimitat de les dades importades i de la revisió prèvia a consolidar o exportar."],
        ["Limitació de responsabilitat", "L'eina s'ofereix en validació controlada i no substitueix processos legals, tècnics o organitzatius propis de l'usuari."],
        ["Tractament de dades", "El mode per defecte és privat sense emmagatzematge permanent. La persistència requereix configuració expressa."],
        ["Revisió humana", "Tota consolidació i XML exportat ha de revisar-se per una persona abans d'ús oficial o comunicació a tercers."],
        ["Canvis", "L'aplicació pot actualitzar validacions, seguretat, textos i flux durant la fase pre-MVP."],
      ],
    },
    fr: {
      title: "Conditions d'utilisation d'Anclora SyncXML",
      sections: [
        ["Objet", "Anclora SyncXML aide à préparer, valider, réviser et exporter du XML à partir des données de réservations et de clients."],
        ["Usage autorisé", "Il peut être utilisé pour des opérations internes autorisées, la révision humaine et l'export contrôlé."],
        ["Usage interdit", "Les fichiers ne doivent pas être importés sans autorisation, avec des données inutiles, excessives ou des informations de paiement sensibles non requises."],
        ["Responsabilité", "L'utilisateur est responsable de la légitimité des données importées et de leur vérification avant consolidation ou export."],
        ["Limitation de responsabilité", "L'outil est fourni en validation contrôlée et ne remplace pas les propres processus légaux, techniques ou organisationnels de l'utilisateur."],
        ["Traitement des données", "Le mode par défaut est privé sans stockage permanent. La persistance requiert une configuration explicite."],
        ["Révision humaine", "Toute consolidation et tout XML exporté doit être vérifié par une personne avant usage officiel ou transmission à des tiers."],
        ["Modifications", "L'application peut mettre à jour les validations, la sécurité, les textes et le flux de travail durant la phase pré-MVP."],
      ],
    },
    it: {
      title: "Condizioni d'uso di Anclora SyncXML",
      sections: [
        ["Oggetto", "Anclora SyncXML aiuta a preparare, validare, rivedere ed esportare file XML dai dati di prenotazioni e ospiti."],
        ["Uso consentito", "Può essere utilizzato per operazioni interne autorizzate, revisione umana ed esportazione controllata."],
        ["Uso vietato", "Non devono essere caricati file senza autorizzazione, con dati non necessari, dati eccessivi o informazioni di pagamento sensibili non richieste."],
        ["Responsabilità", "L'utente è responsabile della legittimità dei dati importati e della verifica prima della consolidazione o dell'esportazione."],
        ["Limitazione di responsabilità", "Lo strumento è fornito in fase di validazione controllata e non sostituisce i propri processi legali, tecnici o organizzativi dell'utente."],
        ["Trattamento dei dati", "La modalità predefinita è privata senza archiviazione permanente. La persistenza richiede una configurazione esplicita."],
        ["Revisione umana", "Ogni consolidazione e file XML esportato deve essere verificato da una persona prima dell'uso ufficiale o della trasmissione a terzi."],
        ["Modifiche", "L'applicazione può aggiornare validazioni, sicurezza, testi e flusso di lavoro durante la fase pre-MVP."],
      ],
    },
    pt: {
      title: "Termos de utilização do Anclora SyncXML",
      sections: [
        ["Objecto", "Anclora SyncXML ajuda a preparar, validar, rever e exportar ficheiros XML a partir de dados de reservas e hóspedes."],
        ["Utilização permitida", "Pode ser utilizado para operações internas autorizadas, revisão humana e exportação controlada."],
        ["Utilização proibida", "Não devem ser carregados ficheiros sem autorização, com dados desnecessários, dados excessivos ou informações de pagamento sensíveis não requeridas."],
        ["Responsabilidade", "O utilizador é responsável pela legitimidade dos dados importados e pela revisão prévia à consolidação ou exportação."],
        ["Limitação de responsabilidade", "A ferramenta é fornecida em validação controlada e não substitui os próprios processos legais, técnicos ou organizacionais do utilizador."],
        ["Tratamento de dados", "O modo por defeito é privado sem armazenamento permanente. A persistência requer configuração expressa."],
        ["Revisão humana", "Toda a consolidação e XML exportado deve ser revisto por uma pessoa antes de uso oficial ou comunicação a terceiros."],
        ["Alterações", "A aplicação pode actualizar validações, segurança, textos e fluxo durante a fase pré-MVP."],
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
  return (
    <LandingLocaleProvider>
      <LegalPageInner type={type} />
    </LandingLocaleProvider>
  );
}

function LegalPageInner({ type }: { type: "privacy" | "terms" }) {
  const { language } = usePreferences();
  const { copy } = useLandingI18n();
  const page = copy.legal[type] ?? content[type][language as keyof typeof content[typeof type]] ?? content[type].es;
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
