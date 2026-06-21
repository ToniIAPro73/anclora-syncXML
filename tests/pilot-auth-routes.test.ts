import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const OLD_ENV = { ...process.env };

const pilotUserState = vi.hoisted(() => ({
  user: null as null | {
    id: string;
    email: string;
    name?: string | null;
    company?: string | null;
    passwordHash: string;
    temporaryPassword: boolean;
    role: "pilot_user";
    status: "active" | "revoked" | "expired";
    sourceRequestId?: string | null;
    expiresAt?: Date | null;
    lastLoginAt?: Date | null;
  },
  createCount: 0,
  updateCount: 0,
}));

vi.mock("@/lib/db/prisma", () => ({
  hasDatabase: () => Boolean(process.env.DATABASE_URL || process.env.DIRECT_URL),
  prisma: {
    pilotUser: {
      findUnique: vi.fn(async ({ where }: { where: { email?: string; id?: string } }) => {
        if (!pilotUserState.user) return null;
        if (where.email && pilotUserState.user.email === where.email) return pilotUserState.user;
        if (where.id && pilotUserState.user.id === where.id) return pilotUserState.user;
        return null;
      }),
      create: vi.fn(async ({ data }) => {
        pilotUserState.createCount += 1;
        pilotUserState.user = {
          id: "pilot-1",
          role: "pilot_user",
          ...data,
        };
        return pilotUserState.user;
      }),
      update: vi.fn(async ({ data }) => {
        pilotUserState.updateCount += 1;
        pilotUserState.user = {
          ...(pilotUserState.user ?? {
            id: "pilot-1",
            email: "pilot@example.com",
            role: "pilot_user" as const,
            passwordHash: "valid-hash",
            temporaryPassword: true,
            status: "active" as const,
          }),
          ...data,
        };
        return pilotUserState.user;
      }),
    },
  },
}));

vi.mock("@/lib/password", () => ({
  generateTemporaryPassword: () => "Temp-Generated-Password",
  hashPassword: (password: string) => `hash:${password}`,
  verifyPassword: (password: string, storedHash: string) => storedHash === `hash:${password}`,
}));

function jsonRequest(body: unknown, headers?: Record<string, string>) {
  return new Request("https://anclora-syncxml.test/api", {
    method: "POST",
    headers: { "content-type": "application/json", ...(headers ?? {}) },
    body: JSON.stringify(body),
  });
}

function configureProductionAuth() {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("DATABASE_URL", "postgresql://user:pass@db.example/syncxml");
  vi.stubEnv("SESSION_SECRET", "stable-session-secret");
  vi.stubEnv("SYNCXML_INTERNAL_API_SECRET", "internal-secret");
  vi.stubEnv("SYNCXML_DISABLE_AUTH", "false");
}

beforeEach(() => {
  vi.resetModules();
  pilotUserState.user = null;
  pilotUserState.createCount = 0;
  pilotUserState.updateCount = 0;
});

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...OLD_ENV };
});

describe("pilot auth routes", () => {
  it("returns 503 without secrets or personal data when production auth config is incomplete", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@db.example/syncxml");
    vi.stubEnv("SESSION_SECRET", "");
    vi.stubEnv("AUTH_SECRET", "");
    vi.stubEnv("SYNCXML_DISABLE_AUTH", "true");

    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(jsonRequest({
      email: "person@example.com",
      password: "secret-password",
    }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("SYNCXML_AUTH_CONFIG_INCOMPLETE");
    expect(JSON.stringify(body)).not.toContain("person@example.com");
    expect(JSON.stringify(body)).not.toContain("secret-password");
  });

  it("returns 401, not 503, for an unknown email when auth config is complete", async () => {
    configureProductionAuth();

    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(jsonRequest({
      email: "missing@example.com",
      password: "wrong-password",
    }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("SYNCXML_INVALID_CREDENTIALS");
  });

  it("logs in a persisted active PilotUser with valid credentials", async () => {
    configureProductionAuth();
    pilotUserState.user = {
      id: "pilot-1",
      email: "pilot@example.com",
      passwordHash: "hash:valid-password",
      temporaryPassword: true,
      role: "pilot_user",
      status: "active",
      expiresAt: new Date(Date.now() + 86_400_000),
    };

    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(jsonRequest({
      email: "pilot@example.com",
      password: "valid-password",
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.temporaryPassword).toBe(true);
  });

  it("denies an expired PilotUser with a clear response", async () => {
    configureProductionAuth();
    pilotUserState.user = {
      id: "pilot-1",
      email: "pilot@example.com",
      passwordHash: "hash:valid-password",
      temporaryPassword: true,
      role: "pilot_user",
      status: "active",
      expiresAt: new Date(Date.now() - 86_400_000),
    };

    const { POST } = await import("@/app/api/auth/login/route");
    const response = await POST(jsonRequest({
      email: "pilot@example.com",
      password: "valid-password",
    }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("SYNCXML_PILOT_ACCESS_EXPIRED");
  });

  it("refuses internal provisioning when persistent login config is incomplete", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@db.example/syncxml");
    vi.stubEnv("SYNCXML_INTERNAL_API_SECRET", "internal-secret");
    vi.stubEnv("SESSION_SECRET", "");

    const { POST } = await import("@/app/api/internal/pilot-users/route");
    const response = await POST(jsonRequest(
      { requestId: "req-1", email: "pilot@example.com" },
      { authorization: "Bearer internal-secret" },
    ));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("SYNCXML_PILOT_AUTH_CONFIG_INCOMPLETE");
    expect(pilotUserState.createCount).toBe(0);
  });

  it("confirms persisted active user before returning provisioning success", async () => {
    configureProductionAuth();
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString();

    const { POST } = await import("@/app/api/internal/pilot-users/route");
    const response = await POST(jsonRequest(
      { requestId: "req-1", email: "pilot@example.com", expiresAt },
      { authorization: "Bearer internal-secret" },
    ));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.loginReady).toBe(true);
    expect(body.email).toBe("pilot@example.com");
    expect(body.temporaryPassword).toBe("Temp-Generated-Password");
    expect(pilotUserState.createCount).toBe(1);
  });

  it("same active user retry does not create duplicate credentials", async () => {
    configureProductionAuth();
    pilotUserState.user = {
      id: "pilot-1",
      email: "pilot@example.com",
      passwordHash: "hash:existing-password",
      temporaryPassword: true,
      role: "pilot_user",
      status: "active",
      expiresAt: new Date(Date.now() + 86_400_000),
    };

    const { POST } = await import("@/app/api/internal/pilot-users/route");
    const response = await POST(jsonRequest(
      { requestId: "req-1", email: "pilot@example.com" },
      { authorization: "Bearer internal-secret" },
    ));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.created).toBe(false);
    expect(body.temporaryPassword).toBeNull();
    expect(pilotUserState.createCount).toBe(0);
    expect(pilotUserState.updateCount).toBe(0);
  });
});
