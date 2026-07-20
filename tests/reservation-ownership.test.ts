import { afterEach, describe, expect, it, vi } from "vitest";
import type { GeneratedXmlResult, ParsedExcel } from "@/lib/domain";

const OLD_ENV = { ...process.env };

function parsed(reference: string): ParsedExcel {
  return {
    fileName: `${reference}.xlsx`,
    sheets: ["Sheet1"],
    reservation: { reference, guestCount: 0, roomCount: 1, internet: true },
    property: { name: "Synthetic Hotel", countryIso3: "ESP" },
    payment: { paymentType: "OTRO" },
    guests: [],
    ignoredRows: [],
    rawRows: [],
    duplicates: [],
    validation: { status: "VALID", errors: [], warnings: [] },
  } as ParsedExcel;
}

function generated(): GeneratedXmlResult {
  return {
    xml: "<root />",
    status: "generated",
    visual: { reservation: {}, property: {}, payment: {}, guests: [] },
    validation: { status: "VALID", errors: [], warnings: [] },
  } as GeneratedXmlResult;
}

afterEach(() => {
  vi.unstubAllEnvs();
  process.env = { ...OLD_ENV };
});

describe("reservation ownership", () => {
  it("isolates memory reservations by owner", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("SYNCXML_ENABLE_PERSISTENT_STORAGE", "false");
    const { createReservation, getReservation, listReservations, deleteReservation } = await import("@/lib/db/reservations");

    const ownerOne = await createReservation({ parsed: parsed("owner-one"), generated: generated(), ownerId: "pilot-1" });
    const ownerTwo = await createReservation({ parsed: parsed("owner-two"), generated: generated(), ownerId: "pilot-2" });

    await expect(listReservations({ ownerId: "pilot-1" })).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: ownerOne.id, ownerId: "pilot-1" })]),
    );
    await expect(listReservations({ ownerId: "pilot-1" })).resolves.not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: ownerTwo.id })]),
    );
    await expect(getReservation(ownerTwo.id, "pilot-1")).resolves.toBeUndefined();
    await expect(deleteReservation(ownerTwo.id, "pilot-1")).resolves.toBeUndefined();
  });

  it("fails closed in production when reservation persistence is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "");
    vi.stubEnv("DIRECT_URL", "");
    vi.stubEnv("SYNCXML_ENABLE_PERSISTENT_STORAGE", "false");
    const { createReservation, ReservationPersistenceUnavailableError } = await import("@/lib/db/reservations");

    await expect(createReservation({ parsed: parsed("prod-no-db"), generated: generated(), ownerId: "pilot-1" }))
      .rejects.toBeInstanceOf(ReservationPersistenceUnavailableError);
  });
});
