import type { Metadata } from "next";
import { LandingAnalytics } from "@/components/landing/LandingAnalytics";
import { PilotRequestForm } from "@/components/landing/PilotRequestForm";

export const metadata: Metadata = {
  title: "Solicitar piloto controlado — Anclora SyncXML",
  description:
    "Solicita participar en el piloto controlado de Anclora SyncXML. Revisamos el encaje antes de conceder acceso. Sin datos reales de huéspedes.",
};

export default function PilotPage() {
  return (
    <div className="landing-root">
      <LandingAnalytics />
      <main className="l-container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <span className="l-eyebrow">Programa de validación controlada</span>
          <h1 className="l-h2 mt-3">Solicitar piloto controlado</h1>
          <p className="l-lead mt-4">
            Cuéntanos cómo trabajas hoy con Excel/XLSX. Con esta información
            valoramos el encaje del piloto. No incluyas datos reales de
            huéspedes: la validación se hace con datos sintéticos o anonimizados.
          </p>
          <div className="mt-8">
            <PilotRequestForm />
          </div>
        </div>
      </main>
    </div>
  );
}
