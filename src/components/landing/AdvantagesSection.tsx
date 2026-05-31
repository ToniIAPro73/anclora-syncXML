import { useLandingI18n } from "@/lib/i18n/landing";
import { FeatureCard } from "./FeatureCard";
import { SectionHeading } from "./SectionHeading";
import { ADVANTAGES } from "./landingData";

export function AdvantagesSection() {
  const { copy } = useLandingI18n();
  return (
    <section className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.advantages.eyebrow}
          title={copy.advantages.title}
          intro={copy.advantages.intro}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map((card, index) => (
            <FeatureCard key={copy.advantages.cards[index].title} {...copy.advantages.cards[index]} icon={card.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
