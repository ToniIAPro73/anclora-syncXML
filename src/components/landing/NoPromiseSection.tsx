import { Minus } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { NO_PROMISE } from "./landingData";

export function NoPromiseSection() {
  return (
    <section className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="Alcance honesto"
          title="Qué no promete Anclora SyncXML"
          intro="Dejar claro el alcance evita falsas expectativas. Esto es parte del producto, no una nota al pie."
        />
        <div className="l-card mt-10">
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {NO_PROMISE.map((item) => (
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
    </section>
  );
}
