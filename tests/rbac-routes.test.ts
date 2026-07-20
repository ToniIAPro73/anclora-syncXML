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

function postRequest(body: unknown) {
  return new Request("https://anclora-syncxml.test/api", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": crypto.randomUUID() },
    body: JSON.stringify(body),
  });
}

async function setCookieFor(user: { id?: string; email: string; role: "admin" | "pilot_user" }) {
  const { setSessionCookie } = await import("@/lib/auth");
  const response = await setSessionCookie(NextResponse.json({ ok: true }), user);
  cookieState.value = readCookieValue(response);
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

describe("RBAC route guards", () => {
  it("denies unauthenticated SES communication requests", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { POST } = await import("@/app/api/ses/communicate/route");
    const response = await POST(postRequest({ xml: "<root />" }));

    expect(response.status).toBe(401);
  });

  it("denies pilot users on SES communication routes", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await setCookieFor({ id: "pilot-1", email: "pilot@example.com", role: "pilot_user" });
    const { POST } = await import("@/app/api/ses/communicate/route");
    const response = await POST(postRequest({ xml: "<root />", environment: "prod", dryRun: false }));

    expect(response.status).toBe(403);
  });

  it("requires explicit server opt-in for admin production SES sends", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SYNCXML_ALLOW_SES_PRODUCTION_SEND", "false");
    await setCookieFor({ id: "admin", email: "admin@example.com", role: "admin" });
    const { POST } = await import("@/app/api/ses/communicate/route");
    const response = await POST(postRequest({ xml: "<root />", environment: "prod", dryRun: false }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.code).toBe("SYNCXML_SES_PRODUCTION_SEND_DISABLED");
  });

  it("denies pilot users on admin INE routes", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await setCookieFor({ id: "pilot-1", email: "pilot@example.com", role: "pilot_user" });
    const { GET } = await import("@/app/api/admin/ine/municipios/route");
    const response = await GET(new Request("https://anclora-syncxml.test/api/admin/ine/municipios"));

    expect(response.status).toBe(403);
  });
});
