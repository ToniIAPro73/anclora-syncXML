import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  evaluateAdminAccess,
  parseAllowedEnvs,
  safeTokenEquals,
  type AdminAccessEnv,
} from "@/lib/security/adminAccess";

const root = fileURLToPath(new URL("..", import.meta.url));
const STRONG_TOKEN = "s3cr3t-strong-token-AbCdEfGhIjKlMnOpQrStUvWxYz-0123456789";

function base(overrides: Partial<Parameters<typeof evaluateAdminAccess>[0]> = {}) {
  return {
    enabled: true,
    token: STRONG_TOKEN,
    providedToken: STRONG_TOKEN,
    env: "development" as AdminAccessEnv,
    allowedEnvs: ["preview", "development"] as AdminAccessEnv[],
    allowInProduction: false,
    ...overrides,
  };
}

describe("admin access — decision logic", () => {
  it("1. does not work when SYNCXML_ADMIN_ACCESS_ENABLED is false", () => {
    expect(evaluateAdminAccess(base({ enabled: false }))).toBe(false);
  });

  it("2. rejects a missing token", () => {
    expect(evaluateAdminAccess(base({ providedToken: "" }))).toBe(false);
  });

  it("3. rejects an incorrect token", () => {
    expect(evaluateAdminAccess(base({ providedToken: "wrong-token" }))).toBe(false);
  });

  it("4. accepts the correct token in development and preview", () => {
    expect(evaluateAdminAccess(base({ env: "development" }))).toBe(true);
    expect(evaluateAdminAccess(base({ env: "preview" }))).toBe(true);
  });

  it("5. rejects in production without the double opt-in", () => {
    expect(evaluateAdminAccess(base({ env: "production", allowInProduction: false }))).toBe(false);
  });

  it("6. works in production only with the explicit double opt-in", () => {
    expect(evaluateAdminAccess(base({ env: "production", allowInProduction: true }))).toBe(true);
  });

  it("rejects when no token is configured even if one is provided", () => {
    expect(evaluateAdminAccess(base({ token: "" }))).toBe(false);
  });

  it("rejects an environment outside the allow-list", () => {
    expect(evaluateAdminAccess(base({ env: "preview", allowedEnvs: ["development"] }))).toBe(false);
  });
});

describe("admin access — helpers", () => {
  it("compares tokens in constant time and rejects length mismatch", () => {
    expect(safeTokenEquals(STRONG_TOKEN, STRONG_TOKEN)).toBe(true);
    expect(safeTokenEquals("a", "ab")).toBe(false);
    expect(safeTokenEquals("", "")).toBe(false);
  });

  it("parses and sanitizes the allowed-env list", () => {
    expect(parseAllowedEnvs("preview,development")).toEqual(["preview", "development"]);
    expect(parseAllowedEnvs(" Preview , bogus , production ")).toEqual(["preview", "production"]);
    expect(parseAllowedEnvs(undefined)).toEqual(["preview", "development"]);
  });
});

describe("admin access — HTTP route", () => {
  const ENV_KEYS = [
    "SYNCXML_ADMIN_ACCESS_ENABLED",
    "SYNCXML_ADMIN_ACCESS_TOKEN",
    "SYNCXML_ALLOW_ADMIN_ACCESS_IN_PRODUCTION",
    "SYNCXML_ADMIN_ACCESS_ALLOWED_ENV",
    "SYNCXML_ADMIN_EMAIL",
    "VERCEL_ENV",
    "SESSION_SECRET",
  ];
  const snapshot = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (snapshot[key] === undefined) delete process.env[key];
      else process.env[key] = snapshot[key];
    }
  });

  async function callRoute(token: string) {
    const { GET } = await import("@/app/api/internal/admin-access/route");
    return GET(new Request(`https://syncxml.test/api/internal/admin-access?token=${token}`));
  }

  it("returns a generic 404 when disabled", async () => {
    process.env.SYNCXML_ADMIN_ACCESS_ENABLED = "false";
    process.env.SYNCXML_ADMIN_ACCESS_TOKEN = STRONG_TOKEN;
    process.env.VERCEL_ENV = "preview";
    const res = await callRoute(STRONG_TOKEN);
    expect(res.status).toBe(404);
  });

  it("7. creates an admin session and redirects on a valid token", async () => {
    process.env.SYNCXML_ADMIN_ACCESS_ENABLED = "true";
    process.env.SYNCXML_ADMIN_ACCESS_TOKEN = STRONG_TOKEN;
    process.env.SYNCXML_ADMIN_ACCESS_ALLOWED_ENV = "preview,development";
    process.env.SYNCXML_ADMIN_EMAIL = "antonio@anclora.com";
    process.env.VERCEL_ENV = "preview";
    process.env.SESSION_SECRET = "test-session-secret-value-for-admin-access-route";

    const res = await callRoute(STRONG_TOKEN);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toContain("/app");

    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toContain("anclora-syncxml-session=");
    expect(setCookie).toContain("HttpOnly");
    // The session payload encodes the admin email + role; assert it is present.
    const cookieValue = decodeURIComponent(setCookie.split("anclora-syncxml-session=")[1]?.split(";")[0] || "");
    const payload = JSON.parse(Buffer.from(cookieValue.split(".")[0], "base64url").toString("utf8"));
    expect(payload.role).toBe("admin");
    expect(payload.email).toBe("antonio@anclora.com");
  });
});

describe("admin access — safety guarantees", () => {
  it("8. does not expose the admin access endpoint in the public landing", () => {
    const landingDir = `${root}/src/components/landing`;
    const landing = readdirSync(landingDir)
      .filter((file) => file.endsWith(".tsx") || file.endsWith(".ts"))
      .map((file) => readFileSync(`${landingDir}/${file}`, "utf8"))
      .join("\n");
    expect(landing).not.toContain("admin-access");
    expect(landing).not.toContain("SYNCXML_ADMIN_ACCESS_TOKEN");
  });

  it("9. never logs or echoes the token in the route", () => {
    const routeSource = readFileSync(
      `${root}/src/app/api/internal/admin-access/route.ts`,
      "utf8",
    );
    // No console call may interpolate the provided/expected token.
    expect(routeSource).not.toMatch(/console\.\w+\([^)]*providedToken/);
    expect(routeSource).not.toMatch(/console\.\w+\([^)]*\.token/);
    // The rejection response is generic.
    expect(routeSource).toContain('{ error: "Not found" }');
  });
});
