import { Minus } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { SectionHeading } from "./SectionHeading";
import { NO_PROMISE } from "./landingData";

export function NoPromiseSection() {
  const { copy } = useLandingI18n();
  return (
    <section className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow={copy.noPromise.eyebrow}
          title={copy.noPromise.title}
          intro={copy.noPromise.intro}
        />
        <div className="l-card mt-10">
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {NO_PROMISE.map((_, index) => (
              <li key={copy.noPromise.items[index]} className="flex items-start gap-3">
                <span className="l-check l-check-neg" aria-hidden="true">
                  <Minus className="h-3.5 w-3.5" />
                </span>
                <span className="l-text text-sm">{copy.noPromise.items[index]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
