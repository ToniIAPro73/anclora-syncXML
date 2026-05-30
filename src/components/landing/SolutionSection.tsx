import { Ban, Check } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { HERO_FLOW, SOLUTION_NOT } from "./landingData";

export function SolutionSection() {
  return (
    <section className="l-section">
      <div className="l-container">
        <SectionHeading
          eyebrow="La solución"
          title="Una capa ligera entre tu Excel y un XML revisable"
          intro="Anclora SyncXML no sustituye tus herramientas: se sitúa entre tu hoja de cálculo y el XML, ayudando a revisar y preparar los datos."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="l-card l-card-gold">
            <p className="l-eyebrow">Cómo encaja</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-3">
              {HERO_FLOW.map(({ label, icon: Icon }, index) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="l-flow-node">
                    <Icon className="h-4 w-4 text-[color:var(--l-gold)]" aria-hidden="true" />
                    {label}
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
              Una capa especializada de revisión, preparación y generación de XML
              revisable orientada al flujo SES.HOSPEDAJES, con revisión humana
              antes de cualquier uso oficial.
            </p>
          </div>

          <div className="l-card">
            <p className="l-eyebrow">Para que quede claro</p>
            <ul className="mt-5 flex flex-col gap-3">
              {SOLUTION_NOT.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="l-check l-check-neg" aria-hidden="true">
                    <Ban className="h-3.5 w-3.5" />
                  </span>
                  <span className="l-text text-sm">{item}</span>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <span className="l-check l-check-pos" aria-hidden="true">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-white">
                  Es una capa especializada de revisión, preparación y generación
                  de XML revisable.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
