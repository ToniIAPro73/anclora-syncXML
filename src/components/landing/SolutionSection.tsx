import { Ban, Check } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { SectionHeading } from "./SectionHeading";
import { HERO_FLOW, SOLUTION_NOT } from "./landingData";

export function SolutionSection() {
  const { copy } = useLandingI18n();
  return (
    <section id="producto" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.solution.eyebrow}
          title={copy.solution.title}
          intro={copy.solution.intro}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="l-card l-card-gold">
            <p className="l-eyebrow">{copy.solution.fitLabel}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-3">
              {HERO_FLOW.map(({ icon: Icon }, index) => (
                <div key={copy.flow[index]} className="flex items-center gap-2">
                  <span className="l-flow-node">
                    <Icon className="h-4 w-4 text-[color:var(--l-gold)]" aria-hidden="true" />
                    {copy.flow[index]}
                  </span>
                  {index < HERO_FLOW.length - 1 ? (
                    <span className="l-flow-arrow text-lg" aria-hidden="true">
                      →
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            <p className="l-text mt-6 text-sm">
              {copy.solution.fitCopy}
            </p>
          </div>

          <div className="l-card">
            <p className="l-eyebrow">{copy.solution.clearLabel}</p>
            <ul className="mt-5 flex flex-col gap-3">
              {SOLUTION_NOT.map((_, index) => (
                <li key={copy.solution.not[index]} className="flex items-start gap-3">
                  <span className="l-check l-check-neg" aria-hidden="true">
                    <Ban className="h-3.5 w-3.5" />
                  </span>
                  <span className="l-text text-sm">{copy.solution.not[index]}</span>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <span className="l-check l-check-pos" aria-hidden="true">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-white">
                  {copy.solution.yes}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
