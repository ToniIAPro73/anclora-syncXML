export type SesEnvironment = "pre" | "prod";

export const SES_PRE_ENDPOINT = "https://hospedajes.pre-ses.mir.es/hospedajes-web/ws/v1/comunicacion";
export const SES_PROD_ENDPOINT = "https://hospedajes.ses.mir.es/hospedajes-web/ws/v1/comunicacion";
export const SES_SCHEMA_VERSION = "v3.1.3";
export const SES_SCHEMA_DIR = "schemas/ses-hospedajes/v3.1.3";

export type SesConfig = {
  environment: SesEnvironment;
  endpoint: string;
  username: string;
  password: string;
  landlordCode: string;
  applicationName: string;
  allowProductionSend: boolean;
};

export function getSesConfig(environment: SesEnvironment = (process.env.SYNCXML_SES_ENV as SesEnvironment) || "pre"): SesConfig {
  const resolvedEnvironment = environment === "prod" ? "prod" : "pre";
  const endpoint = process.env.SYNCXML_SES_ENDPOINT
    || (resolvedEnvironment === "prod" ? SES_PROD_ENDPOINT : SES_PRE_ENDPOINT);

  return {
    environment: resolvedEnvironment,
    endpoint,
    username: process.env.SYNCXML_SES_USERNAME || "",
    password: process.env.SYNCXML_SES_PASSWORD || "",
    landlordCode: process.env.SYNCXML_SES_LANDLORD_CODE || "",
    applicationName: process.env.SYNCXML_SES_APPLICATION || "Anclora SyncXML",
    allowProductionSend: process.env.SYNCXML_SES_ALLOW_PRODUCTION_SEND === "true",
  };
}

export function assertSesConfig(config: SesConfig, options: { requireCredentials?: boolean } = {}) {
  const missing: string[] = [];
  if (options.requireCredentials !== false) {
    if (!config.username) missing.push("SYNCXML_SES_USERNAME");
    if (!config.password) missing.push("SYNCXML_SES_PASSWORD");
  }
  if (!config.landlordCode) missing.push("SYNCXML_SES_LANDLORD_CODE");
  if (!config.applicationName) missing.push("SYNCXML_SES_APPLICATION");
  if (missing.length) throw new Error(`Missing SES.HOSPEDAJES configuration: ${missing.join(", ")}`);
  if (config.environment === "prod" && !config.allowProductionSend) {
    throw new Error("SES.HOSPEDAJES production sending is blocked. Set SYNCXML_SES_ALLOW_PRODUCTION_SEND=true only after successful pre-production testing.");
  }
}
