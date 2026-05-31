import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { FeatureCard } from "./FeatureCard";
import { SectionHeading } from "./SectionHeading";
import { PRIVACY_HREF, TERMS_HREF, TRUST_ITEMS } from "./landingData";

export function PrivacyTrustSection() {
  const { copy } = useLandingI18n();
  return (
    <section id="seguridad" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.trust.eyebrow}
          title={copy.trust.title}
          intro={copy.trust.intro}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_ITEMS.map((card, index) => (
            <FeatureCard key={copy.trust.cards[index].title} {...copy.trust.cards[index]} icon={card.icon} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={PRIVACY_HREF} className="l-btn l-btn-secondary">
            {copy.trust.privacyCta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href={TERMS_HREF} className="l-btn l-btn-ghost">
            {copy.trust.termsCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
