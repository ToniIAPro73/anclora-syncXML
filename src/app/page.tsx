import type { Metadata } from "next";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { AdvantagesSection } from "@/components/landing/AdvantagesSection";
import { StatusSection } from "@/components/landing/StatusSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { AccessSection } from "@/components/landing/AccessSection";
import { AppAvailableSection } from "@/components/landing/AppAvailableSection";
import { PrivacyTrustSection } from "@/components/landing/PrivacyTrustSection";
import { NoPromiseSection } from "@/components/landing/NoPromiseSection";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingAnalytics } from "@/components/landing/LandingAnalytics";
import { CookieConsent } from "@/components/landing/CookieConsent";

const title = "Anclora SyncXML — Revisión de huéspedes desde Excel a XML revisable";
const description =
  "Herramienta ligera para revisar datos de huéspedes desde Excel/XLSX y generar XML revisable orientado al flujo SES.HOSPEDAJES, con privacidad por defecto y validación controlada.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Anclora SyncXML",
    images: [{ url: "/brand/logo-anclora-syncxml.png" }],
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function LandingPage() {
  return (
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
      <CookieConsent />
    </div>
  );
}
