import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { APP_HREF, PILOT_EMAIL, PILOT_MAILTO } from "./landingData";

const DEMO_MAILTO =
  `mailto:${PILOT_EMAIL}` +
  "?subject=" +
  encodeURIComponent("Demo con datos sintéticos — Anclora SyncXML");

export function FinalCTA() {
  return (
    <section id="piloto" className="l-section">
      <div className="l-container">
        <div className="l-card l-card-gold relative overflow-hidden p-8 text-center md:p-14">
          <span className="l-eyebrow">Piloto controlado</span>
          <h2 className="l-h2 mx-auto mt-4 max-w-3xl">
            ¿Tu alojamiento trabaja con Excel y necesitas revisar mejor los datos
            de huéspedes?
          </h2>
          <p className="l-lead mx-auto mt-5 max-w-2xl">
            Podemos preparar una demo o piloto controlado con datos sintéticos o
            anonimizados para comprobar si Anclora SyncXML encaja en tu flujo
            actual.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href={PILOT_MAILTO} className="l-btn l-btn-primary">
              Solicitar piloto controlado
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={DEMO_MAILTO} className="l-btn l-btn-secondary">
              Preparar demo con datos sintéticos
            </a>
            <Link href={APP_HREF} className="l-btn l-btn-ghost">
              Abrir aplicación
            </Link>
          </div>
          <p className="l-text mx-auto mt-6 max-w-xl text-sm">
            El piloto se plantea siempre con datos sintéticos o anonimizados. No
            debe usarse con datos reales sin cerrar seguridad, privacidad, RGPD,
            retención y validación técnica.
          </p>
        </div>
      </div>
    </section>
  );
}
