import Link from "next/link";
import { CookieConsent } from "@/components/landing/CookieConsent";
import { FloatingCookieButton } from "@/components/landing/FloatingCookieButton";

export default function CookiesPage() {
  return (
    <div className="landing-root min-h-screen">
      <main className="l-container py-16">
        <section className="l-card l-card-gold p-8">
          <span className="l-eyebrow">Cookies</span>
          <h1 className="l-h1 mt-4">Preferencias de cookies</h1>
          <p className="l-text mt-5 max-w-2xl">
            Actualmente usamos cookies técnicas necesarias para seguridad,
            sesión y funcionamiento del piloto. Si incorporamos analítica,
            preferencias persistentes o marketing, solicitaremos consentimiento
            previo desde el panel de preferencias.
          </p>
          <p className="l-text mt-4 max-w-2xl">
            Puedes reabrir las preferencias en cualquier momento desde el botón
            flotante o desde el enlace Cookies del footer.
          </p>
          <Link href="/" className="l-btn l-btn-secondary mt-8">
            Volver a Anclora SyncXML
          </Link>
        </section>
      </main>
      <FloatingCookieButton />
      <CookieConsent />
    </div>
  );
}
