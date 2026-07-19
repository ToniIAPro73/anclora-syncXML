import type { AppLanguage } from "@/lib/domain";

/**
 * Localized copy for the in-app pilot feedback widget (FASE 9.2 / 9.3).
 *
 * Kept in its own module (not the main dictionaries) to avoid bloating the
 * shared i18n file, while still honouring LOCALIZATION_CONTRACT: every active
 * locale is covered, no hardcoded UI strings, no language mixing.
 *
 * The widget never asks for guest data; feedback is sent through the internal
 * email route without storing guest data.
 */
export type FeedbackCopy = {
  // During use (9.2)
  duringTitle: string;
  duringQuestion: string;
  optClear: string;
  optPartly: string;
  optUnclear: string;
  thanks: string;
  // Close (9.3)
  closeTitle: string;
  closeIntro: string;
  qSolved: string;
  qValue: string;
  qDoubts: string;
  qTrust: string;
  qPay: string;
  qModel: string;
  qRecommend: string;
  payYes: string;
  payMaybe: string;
  payNo: string;
  modelOneOff: string;
  modelMonthly: string;
  modelSetup: string;
  modelPerBooking: string;
  modelTailored: string;
  send: string;
  sending: string;
  sendError: string;
  open: string;
  dismiss: string;
  privacyNote: string;
};

const es: FeedbackCopy = {
  duringTitle: "Tu opinión",
  duringQuestion: "¿Te ha resultado clara esta revisión y te ayudaría a preparar mejor el XML?",
  optClear: "Sí, clara",
  optPartly: "En parte",
  optUnclear: "Poco clara",
  thanks: "Gracias por tu valoración.",
  closeTitle: "Feedback del piloto",
  closeIntro: "Cuéntanos tu experiencia. No incluyas datos reales de huéspedes.",
  qSolved: "¿El piloto resolvió el problema que esperabas?",
  qValue: "¿Qué parte aportó más valor?",
  qDoubts: "¿Qué parte generó dudas?",
  qTrust: "¿Qué necesitarías para usarlo con confianza?",
  qPay: "¿Pagarías por una versión controlada?",
  qModel: "¿Qué modelo preferirías?",
  qRecommend: "¿Recomendarías Anclora SyncXML? (0–10)",
  payYes: "Sí",
  payMaybe: "Quizá",
  payNo: "No por ahora",
  modelOneOff: "Pago único",
  modelMonthly: "Cuota mensual",
  modelSetup: "Setup + mensual",
  modelPerBooking: "Por reserva",
  modelTailored: "Servicio a medida",
  send: "Enviar feedback",
  sending: "Enviando...",
  sendError: "No se pudo enviar el feedback. Inténtalo de nuevo.",
  open: "Dar feedback del piloto",
  dismiss: "Ahora no",
  privacyNote: "Se enviará por correo. No incluye datos de huéspedes.",
};

const en: FeedbackCopy = {
  duringTitle: "Your feedback",
  duringQuestion: "Was this review clear and would it help you prepare the XML better?",
  optClear: "Yes, clear",
  optPartly: "Partly",
  optUnclear: "Not clear",
  thanks: "Thanks for your feedback.",
  closeTitle: "Pilot feedback",
  closeIntro: "Tell us about your experience. Do not include real guest data.",
  qSolved: "Did the pilot solve the problem you expected?",
  qValue: "Which part added the most value?",
  qDoubts: "Which part raised doubts?",
  qTrust: "What would you need to use it with confidence?",
  qPay: "Would you pay for a controlled version?",
  qModel: "Which model would you prefer?",
  qRecommend: "Would you recommend Anclora SyncXML? (0–10)",
  payYes: "Yes",
  payMaybe: "Maybe",
  payNo: "Not yet",
  modelOneOff: "One-off payment",
  modelMonthly: "Monthly fee",
  modelSetup: "Setup + monthly",
  modelPerBooking: "Per booking",
  modelTailored: "Tailored service",
  send: "Send feedback",
  sending: "Sending...",
  sendError: "Could not send feedback. Try again.",
  open: "Give pilot feedback",
  dismiss: "Not now",
  privacyNote: "Sent by email. It contains no guest data.",
};

const de: FeedbackCopy = {
  duringTitle: "Dein Feedback",
  duringQuestion: "War diese Pruefung klar und wuerde sie dir helfen, das XML besser vorzubereiten?",
  optClear: "Ja, klar",
  optPartly: "Teilweise",
  optUnclear: "Unklar",
  thanks: "Danke fuer dein Feedback.",
  closeTitle: "Piloten-Feedback",
  closeIntro: "Erzaehl uns von deiner Erfahrung. Keine echten Gaestedaten angeben.",
  qSolved: "Hat der Pilot das erwartete Problem geloest?",
  qValue: "Welcher Teil brachte den meisten Mehrwert?",
  qDoubts: "Welcher Teil warf Zweifel auf?",
  qTrust: "Was braeuchtest du, um es mit Vertrauen zu nutzen?",
  qPay: "Wuerdest du fuer eine kontrollierte Version zahlen?",
  qModel: "Welches Modell wuerdest du bevorzugen?",
  qRecommend: "Wuerdest du Anclora SyncXML weiterempfehlen? (0–10)",
  payYes: "Ja",
  payMaybe: "Vielleicht",
  payNo: "Noch nicht",
  modelOneOff: "Einmalzahlung",
  modelMonthly: "Monatliche Gebuehr",
  modelSetup: "Setup + monatlich",
  modelPerBooking: "Pro Buchung",
  modelTailored: "Massgeschneiderter Service",
  send: "Feedback senden",
  sending: "Wird gesendet...",
  sendError: "Feedback konnte nicht gesendet werden. Bitte erneut versuchen.",
  open: "Piloten-Feedback geben",
  dismiss: "Jetzt nicht",
  privacyNote: "Wird per E-Mail gesendet. Enthaelt keine Gaestedaten.",
};

const ca: FeedbackCopy = {
  duringTitle: "La teva opinió",
  duringQuestion: "T'ha resultat clara aquesta revisió i t'ajudaria a preparar millor l'XML?",
  optClear: "Sí, clara",
  optPartly: "En part",
  optUnclear: "Poc clara",
  thanks: "Gràcies per la teva valoració.",
  closeTitle: "Feedback del pilot",
  closeIntro: "Explica'ns la teva experiència. No incloguis dades reals d'hostes.",
  qSolved: "El pilot va resoldre el problema que esperaves?",
  qValue: "Quina part va aportar més valor?",
  qDoubts: "Quina part va generar dubtes?",
  qTrust: "Què necessitaries per usar-lo amb confiança?",
  qPay: "Pagaries per una versió controlada?",
  qModel: "Quin model preferiries?",
  qRecommend: "Recomanaries Anclora SyncXML? (0–10)",
  payYes: "Sí",
  payMaybe: "Potser",
  payNo: "Encara no",
  modelOneOff: "Pagament únic",
  modelMonthly: "Quota mensual",
  modelSetup: "Setup + mensual",
  modelPerBooking: "Per reserva",
  modelTailored: "Servei a mesura",
  send: "Enviar feedback",
  sending: "Enviant...",
  sendError: "No s'ha pogut enviar el feedback. Torna-ho a intentar.",
  open: "Donar feedback del pilot",
  dismiss: "Ara no",
  privacyNote: "S'enviarà per correu. No inclou dades d'hostes.",
};

const fr: FeedbackCopy = {
  duringTitle: "Votre avis",
  duringQuestion: "Cette révision était-elle claire et vous aiderait-elle à mieux préparer le XML ?",
  optClear: "Oui, claire",
  optPartly: "En partie",
  optUnclear: "Peu claire",
  thanks: "Merci pour votre retour.",
  closeTitle: "Retour sur le pilote",
  closeIntro: "Parlez-nous de votre expérience. N'incluez aucune donnée réelle de clients.",
  qSolved: "Le pilote a-t-il résolu le problème attendu ?",
  qValue: "Quelle partie a apporté le plus de valeur ?",
  qDoubts: "Quelle partie a soulevé des doutes ?",
  qTrust: "De quoi auriez-vous besoin pour l'utiliser en confiance ?",
  qPay: "Paieriez-vous pour une version contrôlée ?",
  qModel: "Quel modèle préféreriez-vous ?",
  qRecommend: "Recommanderiez-vous Anclora SyncXML ? (0–10)",
  payYes: "Oui",
  payMaybe: "Peut-être",
  payNo: "Pas encore",
  modelOneOff: "Paiement unique",
  modelMonthly: "Abonnement mensuel",
  modelSetup: "Setup + mensuel",
  modelPerBooking: "Par réservation",
  modelTailored: "Service sur mesure",
  send: "Envoyer le retour",
  sending: "Envoi...",
  sendError: "Impossible d'envoyer le retour. Réessayez.",
  open: "Donner un retour sur le pilote",
  dismiss: "Pas maintenant",
  privacyNote: "Envoyé par e-mail. Ne contient aucune donnée client.",
};

const it: FeedbackCopy = {
  duringTitle: "Il tuo parere",
  duringQuestion: "Questa revisione è stata chiara e ti aiuterebbe a preparare meglio l'XML?",
  optClear: "Sì, chiara",
  optPartly: "In parte",
  optUnclear: "Poco chiara",
  thanks: "Grazie per il tuo riscontro.",
  closeTitle: "Feedback del pilota",
  closeIntro: "Raccontaci la tua esperienza. Non includere dati reali degli ospiti.",
  qSolved: "Il pilota ha risolto il problema che ti aspettavi?",
  qValue: "Quale parte ha dato più valore?",
  qDoubts: "Quale parte ha generato dubbi?",
  qTrust: "Cosa ti servirebbe per usarlo con fiducia?",
  qPay: "Pagheresti per una versione controllata?",
  qModel: "Quale modello preferiresti?",
  qRecommend: "Consiglieresti Anclora SyncXML? (0–10)",
  payYes: "Sì",
  payMaybe: "Forse",
  payNo: "Non ancora",
  modelOneOff: "Pagamento unico",
  modelMonthly: "Canone mensile",
  modelSetup: "Setup + mensile",
  modelPerBooking: "Per prenotazione",
  modelTailored: "Servizio su misura",
  send: "Invia feedback",
  sending: "Invio...",
  sendError: "Non è stato possibile inviare il feedback. Riprova.",
  open: "Dai un feedback sul pilota",
  dismiss: "Non ora",
  privacyNote: "Inviato via email. Non contiene dati degli ospiti.",
};

const pt: FeedbackCopy = {
  duringTitle: "A tua opinião",
  duringQuestion: "Esta revisão foi clara e ajudaria-te a preparar melhor o XML?",
  optClear: "Sim, clara",
  optPartly: "Em parte",
  optUnclear: "Pouco clara",
  thanks: "Obrigado pela tua avaliação.",
  closeTitle: "Feedback do piloto",
  closeIntro: "Conta-nos a tua experiência. Não incluas dados reais de hóspedes.",
  qSolved: "O piloto resolveu o problema que esperavas?",
  qValue: "Que parte trouxe mais valor?",
  qDoubts: "Que parte gerou dúvidas?",
  qTrust: "Do que precisarias para o usar com confiança?",
  qPay: "Pagarias por uma versão controlada?",
  qModel: "Que modelo preferirias?",
  qRecommend: "Recomendarias o Anclora SyncXML? (0–10)",
  payYes: "Sim",
  payMaybe: "Talvez",
  payNo: "Ainda não",
  modelOneOff: "Pagamento único",
  modelMonthly: "Mensalidade",
  modelSetup: "Setup + mensal",
  modelPerBooking: "Por reserva",
  modelTailored: "Serviço à medida",
  send: "Enviar feedback",
  sending: "A enviar...",
  sendError: "Não foi possível enviar o feedback. Tenta novamente.",
  open: "Dar feedback do piloto",
  dismiss: "Agora não",
  privacyNote: "Enviado por email. Não inclui dados de hóspedes.",
};

const FEEDBACK_COPY: Record<AppLanguage, FeedbackCopy> = { es, en, de, ca, fr, it, pt };

export function getFeedbackCopy(language: AppLanguage): FeedbackCopy {
  return FEEDBACK_COPY[language] ?? es;
}
