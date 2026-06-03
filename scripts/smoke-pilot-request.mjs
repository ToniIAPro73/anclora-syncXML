import crypto from "crypto";

const webhookUrl = process.env.NEXUS_SYNCXML_WEBHOOK_URL || "http://localhost:8000/api/internal/webhooks/syncxml-pilot";
const webhookSecret = process.env.NEXUS_SYNCXML_WEBHOOK_SECRET || "secret-webhook";

async function sendSmokeRequest(name, email, usesRealGuestData, needsSesAutomaticSubmission, message) {
  const payload = {
    requestId: crypto.randomUUID(),
    source: "syncxml_landing",
    name,
    email,
    companyName: "Villa Kentia Smoke",
    role: "Propietario",
    accommodationType: "Vivienda turística",
    estimatedMonthlyReservations: "10-30",
    currentWorkflow: "Excel manual",
    mainPain: "Preparar XML",
    wantsToValidate: message,
    acceptsSyntheticOrAnonymizedData: true,
    acceptsPilotConditions: true,
    usesRealGuestData,
    needsSesAutomaticSubmission,
    locale: "es",
  };

  const bodyStr = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", webhookSecret).update(bodyStr).digest("hex");

  console.log(`Sending smoke request [${name}] to ${webhookUrl}`);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-SyncXML-Signature": signature,
      },
      body: bodyStr,
    });
    console.log(`Response status: ${res.status}`);
    const data = await res.json().catch(() => null);
    console.log(`Response data:`, data);
  } catch (err) {
    console.error(`Error connecting to webhook:`, err.message);
  }
}

async function run() {
  console.log("--- Caso A (Elegible) ---");
  await sendSmokeRequest("Caso A", "casoa@example.com", false, false, "Datos anonimizados");

  console.log("\\n--- Caso B (Dudoso) ---");
  await sendSmokeRequest("Caso B", "casob@example.com", true, false, "Tengo datos reales listos");

  console.log("\\n--- Caso C (No apto) ---");
  await sendSmokeRequest("Caso C", "casoc@example.com", false, true, "Necesito envio SES automatico");
}

run();
