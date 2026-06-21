export function envFlag(name: string) {
  const value = process.env[name]?.trim().replace(/^["']|["']$/g, "").toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

export function isExplicitLocalDemoMode() {
  return envFlag("SYNCXML_LOCAL_DEMO") && process.env.NODE_ENV !== "production";
}

export function persistentStorageEnabled() {
  return envFlag("SYNCXML_ENABLE_PERSISTENT_STORAGE");
}

export function authDisabled() {
  return envFlag("SYNCXML_DISABLE_AUTH") && process.env.NODE_ENV !== "production";
}

export function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.AUTH_SECRET || "";
}

export function getPersistentPilotAuthConfigError() {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) missing.push("DATABASE_URL");
  if (!getSessionSecret()) missing.push("SESSION_SECRET");
  if (!process.env.SYNCXML_INTERNAL_API_SECRET) missing.push("SYNCXML_INTERNAL_API_SECRET");
  if (process.env.NODE_ENV === "production" && envFlag("SYNCXML_DISABLE_AUTH")) {
    return "SYNCXML_DISABLE_AUTH is not allowed for persistent pilot auth in production";
  }
  return missing.length ? `Missing persistent pilot auth configuration: ${missing.join(", ")}` : null;
}

export function canProvisionPersistentPilotUsers() {
  return getPersistentPilotAuthConfigError() === null;
}

export function getRuntimeConfigError() {
  if (process.env.NODE_ENV !== "production") return null;
  if (envFlag("SYNCXML_DISABLE_AUTH")) return "SYNCXML_DISABLE_AUTH is not allowed in production";
  const missing: string[] = [];
  if (!getSessionSecret()) missing.push("SESSION_SECRET");
  if (!process.env.SYNCXML_ADMIN_PASSWORD && !process.env.DATABASE_URL && !process.env.DIRECT_URL) {
    missing.push("SYNCXML_ADMIN_PASSWORD or DATABASE_URL");
  }
  if (persistentStorageEnabled()) {
    if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) missing.push("DATABASE_URL");
    if (!process.env.SYNCXML_ENCRYPTION_KEY && !process.env.SYNCXML_FILE_ENCRYPTION_KEY) missing.push("SYNCXML_ENCRYPTION_KEY");
  }
  return missing.length ? `Missing critical SyncXML production configuration: ${missing.join(", ")}` : null;
}

export function validateRuntimeConfig() {
  const error = getRuntimeConfigError();
  if (error) throw new Error(error);
}

export function canUsePasswordAuth() {
  if (authDisabled()) return true;
  if (process.env.SYNCXML_ADMIN_PASSWORD && getSessionSecret()) return true;
  if ((process.env.DATABASE_URL || process.env.DIRECT_URL) && getSessionSecret()) return true;
  return isExplicitLocalDemoMode();
}
