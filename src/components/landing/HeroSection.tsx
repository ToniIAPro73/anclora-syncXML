import { ChevronRight } from "lucide-react";
import { AppAccessButton } from "./AppAccessButton";
import { HERO_BADGES, HERO_FLOW, PILOT_MAILTO } from "./landingData";

export function HeroSection() {
  return (
    <section className="l-hero relative overflow-hidden">
      <div className="l-container grid w-full items-center gap-10 py-10 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-8">
        <div>
          <span className="l-eyebrow">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--l-gold)]" />
            PRE-MVP · VALIDACIÓN CONTROLADA
          </span>

          <h1 className="l-h1 mt-4">
            Revisa datos de huéspedes desde Excel antes de generar un{" "}
            <span className="l-gold">XML revisable</span>
          </h1>

          <p className="l-lead mt-5 max-w-xl">
            Anclora SyncXML ayuda a pequeños alojamientos, viviendas turísticas y
            gestores que trabajan con Excel/XLSX a revisar datos de huéspedes,
            detectar errores operativos y preparar un XML revisable orientado al
            flujo SES.HOSPEDAJES.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={PILOT_MAILTO}
              className="l-btn l-btn-primary"
              data-track="click_solicitar_piloto_controlado"
            >
              Solicitar piloto controlado
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#como-funciona"
              className="l-btn l-btn-secondary"
              data-track="click_ver_como_funciona"
            >
              Ver cómo funciona
            </a>
          </div>

          <div className="mt-4">
            <AppAccessButton variant="link">
              Abrir aplicación en validación controlada
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </AppAccessButton>
            <p className="l-text mt-1.5 text-xs">
              Solo para pruebas con datos sintéticos o anonimizados.
            </p>
          </div>

          <p className="l-text mt-5 max-w-xl text-xs leading-relaxed">
            Fase pre-MVP / validación controlada. No garantiza cumplimiento legal,
            no evita sanciones y no incluye integración oficial ni envío
            automático a SES.HOSPEDAJES. No uses datos reales de huéspedes sin
            cerrar previamente seguridad, RGPD, DPA, retención y validación
            técnica.
          </p>

          <ul className="mt-5 flex flex-wrap gap-2">
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
          <div className="l-card l-card-gold p-5 md:p-6">
            <div className="flex items-center gap-4">
              <img
                src="/brand/logo-anclora-syncxml.png"
                alt="Logotipo de Anclora SyncXML"
                width={56}
                height={56}
                className="l-hero-logo h-14 w-14 rounded-full"
              />
              <div>
                <p className="font-heading text-lg font-semibold text-white">
                  Anclora SyncXML
                </p>
                <p className="l-text text-sm">Capa de revisión Excel → XML</p>
              </div>
            </div>

            <hr className="l-divider my-5" />

            <p className="l-eyebrow">Flujo de revisión</p>
            <div className="mt-3 flex flex-col gap-2">
              {HERO_FLOW.map(({ label, icon: Icon }, index) => (
                <div key={label}>
                  <div className="l-flow-node">
                    <span className="l-icon-tile h-9 w-9" aria-hidden="true">
                      <Icon className="h-4 w-4" />
                    </span>
                    {label}
                  </div>
                  {index < HERO_FLOW.length - 1 ? (
                    <div className="flex justify-center py-0.5" aria-hidden="true">
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
