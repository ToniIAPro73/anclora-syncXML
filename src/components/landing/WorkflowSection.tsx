import { SectionHeading } from "./SectionHeading";
import { WORKFLOW_STEPS } from "./landingData";

export function WorkflowSection() {
  return (
    <section id="como-funciona" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="De la hoja de cálculo al XML revisable en cinco pasos"
          intro="Un recorrido lineal y legible, pensado para revisar antes de generar."
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={step.title} className="l-card h-full">
              <div className="flex items-center justify-between">
                <span className="l-step-num" aria-hidden="true">
                  {index + 1}
                </span>
                <step.icon
                  className="h-5 w-5 text-[color:var(--l-gold-soft)]"
                  aria-hidden="true"
                />
              </div>
              <h3 className="l-h3 mt-4 text-base">{step.title}</h3>
              <p className="l-text mt-2 text-sm">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
