import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const OLD_ENV = { ...process.env };

const cookieState = vi.hoisted(() => ({
  value: undefined as string | undefined,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => cookieState.value ? { value: cookieState.value } : undefined,
  })),
}));

function readCookieValue(response: NextResponse) {
  const cookie = response.headers.get("set-cookie");
  return cookie?.match(/anclora-syncxml-session=([^;]+)/)?.[1];
}

beforeEach(() => {
  vi.resetModules();
  cookieState.value = undefined;
  vi.stubEnv("SESSION_SECRET", "test-session-secret-test-session-secret");
  vi.stubEnv("SYNCXML_ADMIN_PASSWORD", "admin-password");
  vi.stubEnv("SYNCXML_DISABLE_AUTH", "false");
  vi.stubEnv("SYNCXML_LOCAL_DEMO", "false");
});

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...OLD_ENV };
});

describe("session authentication", () => {
  it("accepts a valid signed session cookie", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { getSessionUser, setSessionCookie } = await import("@/lib/auth");
    const response = await setSessionCookie(NextResponse.json({ ok: true }), {
      email: "pilot@example.com",
      role: "pilot_user",
      temporaryPassword: true,
    });
    cookieState.value = readCookieValue(response);

    await expect(getSessionUser()).resolves.toEqual({
      email: "pilot@example.com",
      role: "pilot_user",
      temporaryPassword: true,
    });
  });

  it("rejects an invalid signed session cookie", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { getSessionUser } = await import("@/lib/auth");
    cookieState.value = "invalid.cookie";

    await expect(getSessionUser()).resolves.toBeNull();
  });

  it("keeps the legacy SESSION_SECRET cookie fallback disabled in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SYNCXML_ALLOW_LEGACY_SECRET_COOKIE", "true");
    const { getSessionUser } = await import("@/lib/auth");
    cookieState.value = "test-session-secret-test-session-secret";

    await expect(getSessionUser()).resolves.toBeNull();
  });
});
