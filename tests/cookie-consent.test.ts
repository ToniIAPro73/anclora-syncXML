import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptAll,
  analyticsAllowed,
  CONSENT_STORAGE_KEY,
  hasDecided,
  readConsent,
  rejectOptional,
  writeConsent,
} from "@/lib/cookies/consent";

// Minimal localStorage shim for the node test environment.
function installStorage() {
  const store = new Map<string, string>();
  const mock = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  vi.stubGlobal("window", { localStorage: mock, dispatchEvent: () => true, CustomEvent });
  vi.stubGlobal("localStorage", mock);
  return store;
}

describe("cookie consent store", () => {
  beforeEach(() => {
    installStorage();
  });

  it("starts with no decision", () => {
    expect(hasDecided()).toBe(false);
    expect(readConsent()).toBeNull();
    expect(analyticsAllowed()).toBe(false);
  });

  it("acceptAll enables both optional categories", () => {
    acceptAll();
    expect(hasDecided()).toBe(true);
    expect(analyticsAllowed()).toBe(true);
    expect(readConsent()?.preferences).toBe(true);
  });

  it("rejectOptional disables optional categories but records a decision", () => {
    rejectOptional();
    expect(hasDecided()).toBe(true);
    expect(analyticsAllowed()).toBe(false);
    expect(readConsent()?.preferences).toBe(false);
  });

  it("granular save persists per-category choices", () => {
    writeConsent({ preferences: true, analytics: false });
    expect(analyticsAllowed()).toBe(false);
    expect(readConsent()?.preferences).toBe(true);
    expect(readConsent()?.decidedAt).toBeTruthy();
  });

  it("stores under the documented key", () => {
    acceptAll();
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeTruthy();
  });
});
