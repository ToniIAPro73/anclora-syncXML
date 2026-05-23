export function isExplicitLocalDemoMode() {
  return process.env.SYNCXML_LOCAL_DEMO === "true" && process.env.NODE_ENV !== "production";
}

export function persistentStorageEnabled() {
  return process.env.SYNCXML_ENABLE_PERSISTENT_STORAGE === "true";
}

export function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.AUTH_SECRET || "";
}

export function getRuntimeConfigError() {
  if (process.env.NODE_ENV !== "production") return null;
  const missing: string[] = [];
  if (!process.env.SYNCXML_ADMIN_PASSWORD) missing.push("SYNCXML_ADMIN_PASSWORD");
  if (!getSessionSecret()) missing.push("SESSION_SECRET");
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
  if (process.env.SYNCXML_ADMIN_PASSWORD && getSessionSecret()) return true;
  return isExplicitLocalDemoMode();
}
