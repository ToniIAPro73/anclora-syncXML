"use client";

import { LandingLocaleProvider } from "@/lib/i18n/landing";
import { LandingHeader } from "./LandingHeader";
import { HeroSection } from "./HeroSection";
import { ProblemSection } from "./ProblemSection";
import { SolutionSection } from "./SolutionSection";
import { WorkflowSection } from "./WorkflowSection";
import { AdvantagesSection } from "./AdvantagesSection";
import { StatusSection } from "./StatusSection";
import { AudienceSection } from "./AudienceSection";
import { AccessSection } from "./AccessSection";
import { AppAvailableSection } from "./AppAvailableSection";
import { PrivacyTrustSection } from "./PrivacyTrustSection";
import { NoPromiseSection } from "./NoPromiseSection";
import { FinalCTA } from "./FinalCTA";
import { LandingFooter } from "./LandingFooter";
import { LandingAnalytics } from "./LandingAnalytics";
import { CookieConsent } from "./CookieConsent";
import { FloatingCookieButton } from "./FloatingCookieButton";
import { SectionNavigator } from "./SectionNavigator";

export function LandingExperience() {
  return (
    <LandingLocaleProvider>
      <div className="landing-root">
        <LandingAnalytics />
        <LandingHeader />
        <main>
          <HeroSection />
          <ProblemSection />
          <SolutionSection />
          <WorkflowSection />
          <AdvantagesSection />
          <StatusSection />
          <AudienceSection />
          <AccessSection />
          <AppAvailableSection />
          <PrivacyTrustSection />
          <NoPromiseSection />
          <FinalCTA />
        </main>
        <LandingFooter />
        <FloatingCookieButton />
        <SectionNavigator />
        <CookieConsent />
      </div>
    </LandingLocaleProvider>
  );
}
