import { FeatureCard } from "./FeatureCard";
import { SectionHeading } from "./SectionHeading";
import { PROBLEM_CARDS } from "./landingData";

export function ProblemSection() {
  return (
    <section id="problema" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="El problema"
          title="Cuando el flujo depende de Excel, revisar datos de huéspedes puede volverse lento y delicado"
          intro="Las hojas de cálculo son flexibles, pero revisar a mano cada reserva antes de preparar un XML deja margen al error y expone datos sensibles."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEM_CARDS.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
