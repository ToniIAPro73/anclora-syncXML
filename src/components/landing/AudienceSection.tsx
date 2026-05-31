import { Check, Minus } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { SectionHeading } from "./SectionHeading";
import { AUDIENCE_FOR, AUDIENCE_NOT_FOR } from "./landingData";

export function AudienceSection() {
  const { copy } = useLandingI18n();
  return (
    <section id="para-quien-es" className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.audience.eyebrow}
          title={copy.audience.title}
          intro={copy.audience.intro}
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="l-card l-card-gold">
            <h3 className="l-h3">{copy.audience.forTitle}</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {AUDIENCE_FOR.map((_, index) => (
                <li key={copy.audience.forItems[index]} className="flex items-start gap-3">
                  <span className="l-check l-check-pos" aria-hidden="true">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-white">{copy.audience.forItems[index]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="l-card">
            <h3 className="l-h3">{copy.audience.notForTitle}</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {AUDIENCE_NOT_FOR.map((_, index) => (
                <li key={copy.audience.notForItems[index]} className="flex items-start gap-3">
                  <span className="l-check l-check-neg" aria-hidden="true">
                    <Minus className="h-3.5 w-3.5" />
                  </span>
                  <span className="l-text text-sm">{copy.audience.notForItems[index]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
