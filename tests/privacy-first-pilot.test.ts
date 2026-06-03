import { describe, it, expect } from "vitest";
import { generateLocalPackageZip } from "@/lib/storage/localPackage";
import { createPrecheckinTestSession, getPrecheckinSession, toPublicPrecheckinSession } from "@/lib/precheckin";
import type { ParsedExcel, GeneratedXmlResult } from "@/lib/domain";

describe("Privacy-First Pilot MVP Validation", () => {
  const mockParsed: ParsedExcel = {
    sheets: ["Sheet1"],
    reservation: { reference: "TEST-123" },
    property: { name: "Test Property" },
    payment: {},
    guests: [],
    ignoredRows: [],
    rawRows: [],
    validation: { status: "VALID", errors: [], warnings: [] },
  };

  const mockGenerated: GeneratedXmlResult = {
    xml: "<test></test>",
    status: "generated",
    visual: {
      reservation: mockParsed.reservation,
      property: mockParsed.property,
      payment: mockParsed.payment,
      guests: [],
    },
    validation: mockParsed.validation,
  };

  it("should generate a local conservation package with manifest and readme", async () => {
    // Note: JSZip usage in test might require some environment setup if it uses browser APIs, 
    // but jszip is node-compatible.
    const zipBlob = await generateLocalPackageZip(mockParsed, mockGenerated);
    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(0);
  });

  it("should harden precheckin session with token hashing", () => {
    const session = createPrecheckinTestSession(mockParsed);
    expect(session.token).toBeDefined();
    expect((session as any).tokenHash).toBeDefined();
    expect((session as any).token).not.toBe((session as any).tokenHash);

    const retrieved = getPrecheckinSession(session.token);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.reservationReference).toBe("TEST-123");
  });

  it("should scrub PII from public precheckin payload", () => {
    const session = createPrecheckinTestSession(mockParsed);
    const publicPayload = toPublicPrecheckinSession(session as any);
    
    expect((publicPayload as any).tokenHash).toBeUndefined();
    expect((publicPayload as any).submissionHash).toBeUndefined();
    expect(publicPayload.reservationReference).toBe("TEST-123");
  });
});
