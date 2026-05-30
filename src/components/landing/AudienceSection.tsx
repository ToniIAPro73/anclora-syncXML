import { Check, Minus } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { AUDIENCE_FOR, AUDIENCE_NOT_FOR } from "./landingData";

export function AudienceSection() {
  return (
    <section className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="Encaje"
          title="Para quién es y para quién no es"
          intro="Honestidad sobre el encaje desde el principio, para no generar falsas expectativas."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="l-card l-card-gold">
            <h3 className="l-h3">Para quién es</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {AUDIENCE_FOR.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="l-check l-check-pos" aria-hidden="true">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="l-card">
            <h3 className="l-h3">Para quién no es</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {AUDIENCE_NOT_FOR.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="l-check l-check-neg" aria-hidden="true">
                    <Minus className="h-3.5 w-3.5" />
                  </span>
                  <span className="l-text text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
