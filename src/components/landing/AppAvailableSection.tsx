import { AlertTriangle } from "lucide-react";
import { AppAccessButton } from "./AppAccessButton";
import { SectionHeading } from "./SectionHeading";

export function AppAvailableSection() {
  return (
    <section className="l-section">
      <div className="l-container">
        <div className="l-card l-card-gold p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Validación controlada"
                title="Aplicación disponible en validación controlada"
                intro="La aplicación funcional existe y puede explorarse en un entorno de validación controlada. Su objetivo actual es mostrar el flujo de trabajo y validar el producto con datos sintéticos o anonimizados."
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
              <AppAccessButton variant="primary">
                Abrir aplicación en validación controlada
              </AppAccessButton>
              <p className="l-text mt-2.5 text-xs">
                Solo para pruebas con datos sintéticos o anonimizados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
