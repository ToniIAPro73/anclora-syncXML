import { describe, expect, it } from "vitest";
import { formatDashboardDateTime } from "@/lib/dateFormat";

describe("formatDashboardDateTime", () => {
  it("formats date-only values as DD/MM/YYYY", () => {
    expect(formatDashboardDateTime("2026-04-30")).toBe("30/04/2026");
    expect(formatDashboardDateTime("2026-04-30T00:00:00.000Z")).toBe("30/04/2026");
  });

  it("includes time when it is available", () => {
    expect(formatDashboardDateTime("2026-04-30", "12:00:00")).toBe("30/04/2026 12:00:00");
    expect(formatDashboardDateTime("2026-05-03T10:30:45.000Z")).toBe("03/05/2026 10:30:45");
  });
});
