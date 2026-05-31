"use client";

import type { ReactNode } from "react";
import { LandingLocaleProvider, useLandingI18n } from "@/lib/i18n/landing";

export function PilotPageContent({
  analytics,
  form,
  cookieConsent,
}: {
  analytics: ReactNode;
  form: ReactNode;
  cookieConsent: ReactNode;
}) {
  return (
    <LandingLocaleProvider>
      <PilotPageInner analytics={analytics} form={form} cookieConsent={cookieConsent} />
    </LandingLocaleProvider>
  );
}

function PilotPageInner({ analytics, form, cookieConsent }: { analytics: ReactNode; form: ReactNode; cookieConsent: ReactNode }) {
  const { copy } = useLandingI18n();
  return (
    <div className="landing-root">
      {analytics}
      <main className="l-container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <span className="l-eyebrow">{copy.pilotPage.eyebrow}</span>
          <h1 className="l-h2 mt-3">{copy.pilotPage.title}</h1>
          <p className="l-lead mt-4">{copy.pilotPage.intro}</p>
          <div className="mt-8">{form}</div>
        </div>
      </main>
      {cookieConsent}
    </div>
  );
}
