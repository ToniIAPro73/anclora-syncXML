import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { HERO_FLOW, PILOT_HREF } from "./landingData";

export function HeroSection() {
  const { copy } = useLandingI18n();
  return (
    <section id="hero" className="l-hero relative overflow-hidden">
      <div className="l-container grid w-full items-center gap-12 py-12 md:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-10">
        <div className="max-w-2xl">
          <span className="l-eyebrow">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--l-gold)]" />
            {copy.hero.eyebrow}
          </span>

          <h1 className="l-h1 mt-5">
            {copy.hero.titleBefore} <span className="l-gold">{copy.hero.titleHighlight}</span>, {copy.hero.titleAfter}
          </h1>

          <p className="l-lead mt-5 max-w-lg">
            {copy.hero.lead}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={PILOT_HREF}
              className="l-btn l-btn-primary"
              data-track="click_solicitar_piloto_controlado"
            >
              {copy.common.pilotCta}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#acceso-piloto"
              className="l-btn l-btn-secondary"
              data-track="click_lista_espera"
            >
              {copy.common.waitlistCta}
            </a>
          </div>

          <p className="l-text mt-4 max-w-lg text-xs">
            {copy.hero.note}
          </p>
        </div>

        {/* Visual: logo + flow card */}
        <div className="relative">
          <div className="l-card l-card-gold p-5 md:p-6">
            <div className="flex items-center gap-4">
              <img
                src="/brand/logo-anclora-syncxml.png"
                alt={copy.aria.logoAlt}
                width={56}
                height={56}
                className="l-hero-logo h-14 w-14 rounded-full"
              />
              <div>
                <p className="font-heading text-lg font-semibold text-white">
                  Anclora SyncXML
                </p>
                <p className="l-text text-sm">{copy.hero.cardSubtitle}</p>
              </div>
            </div>

            <hr className="l-divider my-5" />

            <p className="l-eyebrow">{copy.hero.flowLabel}</p>
            <div className="mt-3 flex flex-col gap-2">
              {HERO_FLOW.map(({ icon: Icon }, index) => (
                <div key={copy.flow[index]}>
                  <div className="l-flow-node">
                    <span className="l-icon-tile h-9 w-9" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                    {copy.flow[index]}
                  </div>
                  {index < HERO_FLOW.length - 1 ? (
                    <div className="flex justify-center py-0.5" aria-hidden="true">
                      <ChevronRight className="l-flow-arrow h-4 w-4 rotate-90" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
