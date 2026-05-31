import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HERO_FLOW, PILOT_HREF } from "./landingData";

export function HeroSection() {
  return (
    <section id="hero" className="l-hero relative overflow-hidden">
      <div className="l-container grid w-full items-center gap-12 py-12 md:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-10">
        <div className="max-w-2xl">
          <span className="l-eyebrow">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--l-gold)]" />
            Piloto controlado
          </span>

          <h1 className="l-h1 mt-5">
            De Excel a <span className="l-gold">XML revisable</span>, sin fricción.
          </h1>

          <p className="l-lead mt-5 max-w-lg">
            Valida el flujo Excel/XLSX → revisión → XML con datos sintéticos o
            anonimizados. Sin envío automático a SES.HOSPEDAJES ni promesa de
            cumplimiento legal definitivo.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={PILOT_HREF}
              className="l-btn l-btn-primary"
              data-track="click_solicitar_piloto_controlado"
            >
              Solicitar piloto controlado
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#acceso-piloto"
              className="l-btn l-btn-secondary"
              data-track="click_lista_espera"
            >
              Unirme a la lista de espera
            </a>
          </div>

          <p className="l-text mt-4 max-w-lg text-xs">
            Validación inicial con datos sintéticos o anonimizados. Sin envío
            automático a SES.HOSPEDAJES.
          </p>
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
