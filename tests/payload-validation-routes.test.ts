import { beforeEach, describe, expect, it, vi } from "vitest";

const routeCalls = vi.hoisted(() => ({
  smartValidateParsedExcel: vi.fn((value) => value),
  generateHospitalityXml: vi.fn(() => ({
    xml: "<root />",
    status: "generated",
    visual: { reservation: {}, property: {}, payment: {}, guests: [] },
    validation: { status: "VALID", errors: [], warnings: [] },
  })),
  createReservation: vi.fn(async () => ({ id: "reservation-1" })),
}));

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(async () => null),
}));

vi.mock("@/lib/validation", () => ({
  smartValidateParsedExcel: routeCalls.smartValidateParsedExcel,
}));

vi.mock("@/lib/xml/generateHospitalityXml", () => ({
  generateHospitalityXml: routeCalls.generateHospitalityXml,
}));

vi.mock("@/lib/xml/template", () => ({
  readReferenceTemplate: vi.fn(async () => "<template />"),
}));

vi.mock("@/lib/municipios/resolveMunicipio", () => ({
  resolveParsedMunicipiosFromDb: vi.fn(async (parsed) => parsed),
}));

vi.mock("@/lib/db/municipios", () => ({
  prismaMunicipioRepository: {},
}));

vi.mock("@/lib/db/reservations", () => ({
  createReservation: routeCalls.createReservation,
  listReservations: vi.fn(async () => []),
}));

vi.mock("@/lib/audit", () => ({
  pseudonymizeSession: vi.fn(() => "session-hash"),
  recordAuditEvent: vi.fn(),
}));

function jsonRequest(body: unknown) {
  return new Request("https://anclora-syncxml.test/api", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": crypto.randomUUID() },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetModules();
  routeCalls.smartValidateParsedExcel.mockClear();
  routeCalls.generateHospitalityXml.mockClear();
  routeCalls.createReservation.mockClear();
});

describe("critical route payload validation", () => {
  it("rejects malformed generate XML payloads before backend validation", async () => {
    const { POST } = await import("@/app/api/generate/xml/route");
    const response = await POST(jsonRequest({ parsed: { guests: "not-an-array" } }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Payload inválido");
    expect(routeCalls.smartValidateParsedExcel).not.toHaveBeenCalled();
    expect(routeCalls.generateHospitalityXml).not.toHaveBeenCalled();
  });

  it("rejects malformed reservation payloads before persistence", async () => {
    const { POST } = await import("@/app/api/reservations/route");
    const response = await POST(jsonRequest({ parsed: null, generated: "unexpected" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Payload inválido");
    expect(routeCalls.smartValidateParsedExcel).not.toHaveBeenCalled();
    expect(routeCalls.generateHospitalityXml).not.toHaveBeenCalled();
    expect(routeCalls.createReservation).not.toHaveBeenCalled();
  });
});
