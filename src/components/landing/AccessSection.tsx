import { Check } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { SectionHeading } from "./SectionHeading";
import { ACCESS_TIERS } from "./landingData";

export function AccessSection() {
  const { copy } = useLandingI18n();
  return (
    <section id="acceso-piloto" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.access.eyebrow}
          title={copy.access.title}
          intro={copy.access.intro}
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {ACCESS_TIERS.map((tier, index) => {
            const tierCopy = copy.access.tiers[index];
            return (
            <article
              key={tier.id}
              className={`l-card flex h-full flex-col${tier.featured ? " l-card-gold" : ""}`}
            >
              {tier.featured ? (
                <span className="l-tier-flag">{copy.access.recommended}</span>
              ) : null}
              <span className="l-icon-tile" aria-hidden="true">
                <tier.icon className="h-5 w-5" />
              </span>
              <h3 className="l-h3 mt-4">{tierCopy.title}</h3>
              <p className="l-text mt-2 text-sm">{tierCopy.text}</p>

              <p className="l-eyebrow mt-5">{tierCopy.itemsLabel}</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {tierCopy.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="l-check l-check-gold" aria-hidden="true">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="l-text text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.ctaHref}
                data-track={tier.ctaTrack}
                className={`l-btn mt-6 w-full ${tier.featured ? "l-btn-primary" : "l-btn-secondary"}`}
              >
                {tierCopy.ctaLabel}
              </a>
            </article>
          )})}
        </div>

        <p className="l-text mx-auto mt-8 max-w-3xl text-center text-sm">
          {copy.access.priceNote}
        </p>
      </div>
    </section>
  );
}
