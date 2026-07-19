import { afterEach, describe, expect, it, vi } from "vitest";
import { getInternalReplyTo } from "@/lib/email/delivery";

const OLD_ENV = { ...process.env };

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...OLD_ENV };
});

describe("email delivery configuration", () => {
  it("uses the configured internal reply-to inbox", () => {
    vi.stubEnv("RESEND_REPLY_TO", "antonio@anclora.com");
    vi.stubEnv("ADMIN_EMAILS", "admin@anclora.com");

    expect(getInternalReplyTo()).toBe("antonio@anclora.com");
  });

  it("falls back to ADMIN_EMAILS for reply-to", () => {
    vi.stubEnv("RESEND_REPLY_TO", "");
    vi.stubEnv("ADMIN_EMAILS", "antonio@anclora.com");

    expect(getInternalReplyTo()).toBe("antonio@anclora.com");
  });
});
