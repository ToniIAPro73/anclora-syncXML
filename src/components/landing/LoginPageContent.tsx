"use client";

import { LandingLocaleProvider } from "@/lib/i18n/landing";
import { CookieConsent } from "./CookieConsent";
import { LandingAnalytics } from "./LandingAnalytics";
import { LoginView } from "./LoginView";

export function LoginPageContent() {
  return (
    <LandingLocaleProvider>
      <div className="landing-root">
        <LandingAnalytics />
        <LoginView />
        <CookieConsent />
      </div>
    </LandingLocaleProvider>
  );
}
