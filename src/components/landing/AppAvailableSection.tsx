import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { LOGIN_HREF, PILOT_HREF } from "./landingData";

export function AppAvailableSection() {
  return (
    <section className="l-section">
      <div className="l-container">
        <div className="l-card l-card-gold p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Validación controlada"
                title="Aplicación disponible para participantes del piloto"
                intro="La aplicación funcional existe y se explora dentro del piloto controlado, con acceso aprobado de forma manual. Su objetivo actual es mostrar el flujo de trabajo y validar el producto con datos sintéticos o anonimizados."
              />
              <div className="l-notice mt-6">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                <p>
                  <strong className="text-white">Importante:</strong> no subas
                  datos reales de huéspedes. El XML generado es revisable y no
                  implica aceptación oficial por SES.HOSPEDAJES ni garantía legal
                  de cumplimiento.
                </p>
              </div>
            </div>

            <div className="lg:text-right">
              <Link
                href={PILOT_HREF}
                className="l-btn l-btn-primary"
                data-track="click_solicitar_piloto_controlado"
              >
                Solicitar piloto controlado
              </Link>
              <div className="mt-3">
                <Link
                  href={LOGIN_HREF}
                  className="l-applink"
                  data-track="click_iniciar_sesion"
                >
                  Ya participo · Iniciar sesión
                </Link>
              </div>
              <p className="l-text mt-2.5 text-xs">
                Acceso aprobado manualmente. Solo datos sintéticos o anonimizados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
