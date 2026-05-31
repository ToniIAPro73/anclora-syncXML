import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { SectionHeading } from "./SectionHeading";
import { PILOT_HREF } from "./landingData";

export function AppAvailableSection() {
  const { copy } = useLandingI18n();
  return (
    <section className="l-section">
      <div className="l-container">
        <div className="l-card l-card-gold p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow={copy.appAvailable.eyebrow}
                title={copy.appAvailable.title}
                intro={copy.appAvailable.intro}
              />
              <div className="l-notice mt-6">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <p>{copy.appAvailable.important}</p>
              </div>
            </div>

            <div className="lg:text-right">
              <Link
                href={PILOT_HREF}
                className="l-btn l-btn-primary"
                data-track="click_solicitar_piloto_controlado"
              >
                {copy.common.pilotCta}
              </Link>
              <p className="l-text mt-2.5 text-xs">
                {copy.appAvailable.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
