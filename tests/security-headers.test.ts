import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("security headers", () => {
  it("defines a global security header baseline", async () => {
    const headers = await nextConfig.headers?.();
    const globalHeaders = headers?.find((entry) => entry.source === "/(.*)")?.headers ?? [];
    const byKey = new Map(globalHeaders.map((header) => [header.key, header.value]));

    expect(byKey.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(byKey.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(byKey.get("Referrer-Policy")).toBe("no-referrer");
    expect(byKey.get("X-Content-Type-Options")).toBe("nosniff");
    expect(byKey.get("X-Frame-Options")).toBe("DENY");
    expect(byKey.get("Permissions-Policy")).toContain("camera=()");
  });
});
