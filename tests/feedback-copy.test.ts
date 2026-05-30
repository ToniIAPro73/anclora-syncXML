import { describe, expect, it } from "vitest";
import { getFeedbackCopy, type FeedbackCopy } from "@/lib/feedback/feedbackCopy";
import { ACTIVE_APP_LOCALES } from "@/lib/anclora-language-toggle";

const KEYS: (keyof FeedbackCopy)[] = [
  "duringTitle", "duringQuestion", "optClear", "optPartly", "optUnclear", "thanks",
  "closeTitle", "closeIntro", "qSolved", "qValue", "qDoubts", "qTrust", "qPay",
  "qModel", "qRecommend", "payYes", "payMaybe", "payNo", "modelOneOff",
  "modelMonthly", "modelSetup", "modelPerBooking", "modelTailored", "send",
  "open", "dismiss", "privacyNote",
];

describe("pilot feedback copy", () => {
  it("covers every active locale with all keys filled", () => {
    for (const locale of ACTIVE_APP_LOCALES) {
      const copy = getFeedbackCopy(locale);
      for (const key of KEYS) {
        expect(copy[key], `${locale}.${key} missing`).toBeTruthy();
      }
    }
  });

  it("asks for willingness to pay and a recommendation score", () => {
    const es = getFeedbackCopy("es");
    expect(es.qPay.toLowerCase()).toContain("pagar");
    expect(es.qRecommend).toContain("0–10");
  });
});
