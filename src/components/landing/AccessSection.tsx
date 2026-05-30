import { Check } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { ACCESS_TIERS } from "./landingData";

export function AccessSection() {
  return (
    <section id="acceso-piloto" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="Acceso piloto"
          title="Acceso mediante piloto controlado"
          intro="Anclora SyncXML todavía no se ofrece como plan SaaS cerrado. En esta fase trabajamos caso a caso para validar el encaje del producto, el flujo Excel/XLSX y la disposición de pago."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {ACCESS_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`l-card flex h-full flex-col${tier.featured ? " l-card-gold" : ""}`}
            >
              {tier.featured ? (
                <span className="l-tier-flag">Recomendado</span>
              ) : null}
              <span className="l-icon-tile" aria-hidden="true">
                <tier.icon className="h-5 w-5" />
              </span>
              <h3 className="l-h3 mt-4">{tier.title}</h3>
              <p className="l-text mt-2 text-sm">{tier.text}</p>

              <p className="l-eyebrow mt-5">{tier.itemsLabel}</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {tier.items.map((item) => (
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
                {tier.ctaLabel}
              </a>
            </article>
          ))}
        </div>

        <p className="l-text mx-auto mt-8 max-w-3xl text-center text-sm">
          No mostramos precios cerrados todavía. El precio se define tras el
          diagnóstico inicial, según el alcance del Excel/XLSX, el nivel de
          acompañamiento y las condiciones necesarias para un piloto seguro.
        </p>
      </div>
    </section>
  );
}
