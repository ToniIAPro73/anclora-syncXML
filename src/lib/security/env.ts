const productionRequired = ["SYNCXML_ADMIN_PASSWORD", "SESSION_SECRET", "SYNCXML_ENCRYPTION_KEY", "DATABASE_URL"] as const;

export function isExplicitLocalDemoMode() {
  return process.env.SYNCXML_LOCAL_DEMO === "true" && process.env.NODE_ENV !== "production";
}

export function persistentStorageEnabled() {
  return process.env.SYNCXML_ENABLE_PERSISTENT_STORAGE === "true";
}

export function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.AUTH_SECRET || "";
}

export function validateRuntimeConfig() {
  if (process.env.NODE_ENV !== "production") return;
  const missing = productionRequired.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing critical SyncXML production configuration: ${missing.join(", ")}`);
  }
}

export function canUsePasswordAuth() {
  if (process.env.SYNCXML_ADMIN_PASSWORD && getSessionSecret()) return true;
  return isExplicitLocalDemoMode();
}
