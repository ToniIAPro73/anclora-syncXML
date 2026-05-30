import { Check, Clock, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { STATUS_BLOCKS } from "./landingData";
import type { StatusBlock } from "./landingData";

const TONE: Record<
  StatusBlock["tone"],
  { icon: LucideIcon; check: string; gold: boolean }
> = {
  now: { icon: Check, check: "l-check-pos", gold: true },
  pending: { icon: Clock, check: "l-check-neg", gold: false },
  future: { icon: Sparkles, check: "l-check-gold", gold: false },
};

export function StatusSection() {
  return (
    <section className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="Estado actual y evolución prevista"
          title="Qué hay hoy, qué falta y qué vendrá — sin mezclarlo"
          intro="Separamos de forma explícita lo disponible en validación controlada de lo pendiente y lo futuro."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {STATUS_BLOCKS.map((block) => {
            const tone = TONE[block.tone];
            return (
              <article
                key={block.id}
                className={`l-card h-full${tone.gold ? " l-card-gold" : ""}`}
              >
                <span className="l-eyebrow">{block.eyebrow}</span>
                <h3 className="l-h3 mt-2">{block.title}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className={`l-check ${tone.check}`} aria-hidden="true">
                        <tone.icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="l-text text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
