import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { PILOT_HREF } from "./landingData";

export function FinalCTA() {
  const { copy } = useLandingI18n();
  return (
    <section id="piloto" className="l-section">
      <div className="l-container">
        <div className="l-card l-card-gold relative overflow-hidden p-8 text-center md:p-14">
          <span className="l-eyebrow">{copy.finalCta.eyebrow}</span>
          <h2 className="l-h2 mx-auto mt-4 max-w-3xl">
            {copy.finalCta.title}
          </h2>
          <p className="l-lead mx-auto mt-5 max-w-2xl">
            {copy.finalCta.intro}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href={PILOT_HREF}
              className="l-btn l-btn-primary"
              data-track="click_solicitar_piloto_controlado"
            >
              {copy.common.pilotCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#acceso-piloto" className="l-btn l-btn-secondary" data-track="click_lista_espera">
              {copy.common.waitlistCta}
            </a>
          </div>
          <p className="l-text mx-auto mt-6 max-w-xl text-sm">
            {copy.finalCta.note}
          </p>
        </div>
      </div>
    </section>
  );
}
