import { Check, Clock, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
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
  const { copy } = useLandingI18n();
  return (
    <section id="estado" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.status.eyebrow}
          title={copy.status.title}
          intro={copy.status.intro}
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {STATUS_BLOCKS.map((block, index) => {
            const tone = TONE[block.tone];
            const blockCopy = copy.status.blocks[index];
            return (
              <article
                key={block.id}
                className={`l-card h-full${tone.gold ? " l-card-gold" : ""}`}
              >
                <span className="l-eyebrow">{blockCopy.eyebrow}</span>
                <h3 className="l-h3 mt-2">{blockCopy.title}</h3>
                <ul className="mt-5 flex flex-col gap-3">
                  {blockCopy.items.map((item) => (
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
