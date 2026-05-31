import { useLandingI18n } from "@/lib/i18n/landing";
import { FeatureCard } from "./FeatureCard";
import { SectionHeading } from "./SectionHeading";
import { PROBLEM_CARDS } from "./landingData";

export function ProblemSection() {
  const { copy } = useLandingI18n();
  return (
    <section id="problema" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.problem.eyebrow}
          title={copy.problem.title}
          intro={copy.problem.intro}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEM_CARDS.map((card, index) => (
            <FeatureCard key={copy.problem.cards[index].title} {...copy.problem.cards[index]} icon={card.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
