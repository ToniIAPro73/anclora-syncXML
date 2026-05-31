import { useLandingI18n } from "@/lib/i18n/landing";
import { SectionHeading } from "./SectionHeading";
import { WORKFLOW_STEPS } from "./landingData";

export function WorkflowSection() {
  const { copy } = useLandingI18n();
  return (
    <section id="como-funciona" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.workflow.eyebrow}
          title={copy.workflow.title}
          intro={copy.workflow.intro}
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={copy.workflow.steps[index].title} className="l-card h-full">
              <div className="flex items-center justify-between">
                <span className="l-step-num" aria-hidden="true">
                  {index + 1}
                </span>
                <step.icon
                  className="h-5 w-5 text-[color:var(--l-gold-soft)]"
                  aria-hidden="true"
                />
              </div>
              <h3 className="l-h3 mt-4 text-base">{copy.workflow.steps[index].title}</h3>
              <p className="l-text mt-2 text-sm">{copy.workflow.steps[index].text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
