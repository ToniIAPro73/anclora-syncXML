import { FeatureCard } from "./FeatureCard";
import { SectionHeading } from "./SectionHeading";
import { ADVANTAGES } from "./landingData";

export function AdvantagesSection() {
  return (
    <section className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="Ventajas actuales"
          title="Más control antes de preparar el XML"
          intro="Capacidades documentadas como disponibles en validación controlada, descritas con prudencia."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADVANTAGES.map((card) => (
            <FeatureCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
