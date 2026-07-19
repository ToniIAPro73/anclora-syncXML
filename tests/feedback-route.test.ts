import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const OLD_ENV = { ...process.env };
const resendState = vi.hoisted(() => ({
  send: vi.fn(async () => ({ data: { id: "email-1" }, error: null })),
}));

vi.mock("@/lib/auth", () => ({
  getSessionUser: vi.fn(async () => ({ email: "pilot@example.com", role: "pilot_user" })),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(function Resend() {
    return {
      emails: {
        send: resendState.send,
      },
    };
  }),
}));

function jsonRequest(body: unknown) {
  return new Request("https://anclora-syncxml.test/api/feedback", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetModules();
  resendState.send.mockClear();
  vi.stubEnv("RESEND_API_KEY", "resend-key");
  vi.stubEnv("RESEND_FROM", "Anclora SyncXML <piloto@anclora.test>");
  vi.stubEnv("RESEND_REPLY_TO", "antonio@anclora.com");
  vi.stubEnv("SYNCXML_FEEDBACK_TO", "antonio@anclora.com");
});

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...OLD_ENV };
});

describe("pilot feedback route", () => {
  it("sends in-app pilot feedback to the configured feedback inbox", async () => {
    const { POST } = await import("@/app/api/feedback/route");

    const response = await POST(jsonRequest({
      solved: "sí",
      value: "validación",
      recommend: "9",
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(resendState.send).toHaveBeenCalledWith(expect.objectContaining({
      from: "Anclora SyncXML <piloto@anclora.test>",
      to: ["antonio@anclora.com"],
      replyTo: "antonio@anclora.com",
      subject: "Feedback del piloto SyncXML",
    }));
  });

  it("fails closed when Resend is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { POST } = await import("@/app/api/feedback/route");

    const response = await POST(jsonRequest({ value: "test" }));

    expect(response.status).toBe(503);
    expect(resendState.send).not.toHaveBeenCalled();
  });
});
