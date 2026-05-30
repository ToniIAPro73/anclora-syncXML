import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { APP_HREF, HERO_BADGES, HERO_FLOW, PILOT_MAILTO } from "./landingData";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="l-container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="l-eyebrow">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--l-gold)]" />
            Pre-MVP · Validación controlada
          </span>

          <h1 className="l-h1 mt-5">
            Revisa datos de huéspedes desde Excel antes de generar un{" "}
            <span className="l-gold">XML revisable</span>
          </h1>

          <p className="l-lead mt-6 max-w-xl">
            Anclora SyncXML ayuda a pequeños alojamientos, viviendas turísticas y
            gestores a revisar datos de reservas y huéspedes procedentes de
            Excel/XLSX, detectar errores operativos y preparar un XML revisable
            orientado al flujo SES.HOSPEDAJES.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={PILOT_MAILTO} className="l-btn l-btn-primary">
              Solicitar piloto controlado
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link href={APP_HREF} className="l-btn l-btn-ghost">
              Abrir aplicación
            </Link>
            <a href="#como-funciona" className="l-btn l-btn-secondary">
              Ver cómo funciona
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <p className="l-text mt-6 max-w-xl text-sm">
            Actualmente en fase pre-MVP / validación controlada. No constituye
            asesoramiento legal, no garantiza cumplimiento normativo y no implica
            integración oficial automática con SES.HOSPEDAJES.
          </p>

          <ul className="mt-7 flex flex-wrap gap-2.5">
            {HERO_BADGES.map(({ label, icon: Icon }) => (
              <li key={label} className="l-badge">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual: logo + flow card */}
        <div className="relative">
          <div className="l-card l-card-gold p-6 md:p-8">
            <div className="flex items-center gap-4">
              <img
                src="/brand/logo-anclora-syncxml.png"
                alt="Logotipo de Anclora SyncXML"
                width={64}
                height={64}
                className="l-hero-logo h-16 w-16 rounded-full"
              />
              <div>
                <p className="font-heading text-lg font-semibold text-white">
                  Anclora SyncXML
                </p>
                <p className="l-text text-sm">Capa de revisión Excel → XML</p>
              </div>
            </div>

            <hr className="l-divider my-6" />

            <p className="l-eyebrow">Flujo de revisión</p>
            <div className="mt-4 flex flex-col gap-3">
              {HERO_FLOW.map(({ label, icon: Icon }, index) => (
                <div key={label}>
                  <div className="l-flow-node">
                    <span className="l-icon-tile h-9 w-9" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </div>
                  {index < HERO_FLOW.length - 1 ? (
                    <div className="flex justify-center py-1" aria-hidden="true">
                      <ChevronRight className="l-flow-arrow h-4 w-4 rotate-90" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
