import { describe, expect, it } from "vitest";
import { buildXmlDownloadFileName } from "@/lib/xml/fileName";

describe("buildXmlDownloadFileName", () => {
  it("uses reservation reference and DDMMRRHH24MISS timestamp", () => {
    const fileName = buildXmlDownloadFileName(
      {
        reservation: { reference: "5992657522" },
        property: { establishmentCode: "0000044116" },
      },
      new Date(2026, 4, 23, 15, 7, 9),
    );

    expect(fileName).toBe("syncxml-5992657522-230526150709.xml");
  });

  it("falls back to the Excel CODIGO when reference is missing", () => {
    const fileName = buildXmlDownloadFileName(
      {
        reservation: {},
        property: { establishmentCode: "0000044116" },
      },
      new Date(2026, 4, 23, 15, 7, 9),
    );

    expect(fileName).toBe("syncxml-0000044116-230526150709.xml");
  });
});
