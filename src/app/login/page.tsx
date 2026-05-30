import type { Metadata } from "next";
import { LandingAnalytics } from "@/components/landing/LandingAnalytics";
import { CookieConsent } from "@/components/landing/CookieConsent";
import { LoginView } from "@/components/landing/LoginView";

export const metadata: Metadata = {
  title: "Iniciar sesión — Anclora SyncXML",
  description:
    "Acceso autorizado a Anclora SyncXML en validación controlada. La participación en el piloto se concede tras revisión manual de la solicitud.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="landing-root">
      <LandingAnalytics />
      <LoginView />
      <CookieConsent />
    </div>
  );
}
