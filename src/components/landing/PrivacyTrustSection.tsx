import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { SectionHeading } from "./SectionHeading";
import { PRIVACY_HREF, TERMS_HREF, TRUST_ITEMS } from "./landingData";

export function PrivacyTrustSection() {
  return (
    <section id="privacidad" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="Confianza y privacidad"
          title="Prudencia operativa desde el diseño"
          intro="La privacidad no es una capa añadida: orienta cómo se tratan y muestran los datos en cada paso."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_ITEMS.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={PRIVACY_HREF} className="l-btn l-btn-secondary">
            Política de privacidad
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href={TERMS_HREF} className="l-btn l-btn-ghost">
            Términos de uso
          </Link>
        </div>
      </div>
    </section>
  );
}
