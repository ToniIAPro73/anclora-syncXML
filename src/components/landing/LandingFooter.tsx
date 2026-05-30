import Link from "next/link";
import { AppAccessButton } from "./AppAccessButton";
import { CONTACT_MAILTO, PRIVACY_HREF } from "./landingData";

const SECTION_LINKS = [
  { label: "Producto", href: "#producto" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Acceso piloto", href: "#acceso-piloto" },
  { label: "Seguridad y límites", href: "#seguridad" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-[color:var(--l-border)]">
      <div className="l-container py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <img
                src="/brand/logo-anclora-syncxml.png"
                alt="Logotipo de Anclora SyncXML"
                width={34}
                height={34}
                className="h-8 w-8 rounded-full"
              />
              <span className="font-heading text-base font-semibold text-white">
                Anclora SyncXML
              </span>
            </div>
            <p className="l-text mt-4 text-sm">
              Capa ligera para revisar datos de huéspedes desde Excel/XLSX y
              preparar un XML revisable orientado al flujo SES.HOSPEDAJES.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <nav aria-label="Secciones del producto" className="flex flex-col gap-3">
              <span className="l-eyebrow">Producto</span>
              {SECTION_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="l-nav-link">
                  {link.label}
                </a>
              ))}
            </nav>

            <nav aria-label="Recursos y contacto" className="flex flex-col items-start gap-3">
              <span className="l-eyebrow">Recursos</span>
              <Link href={PRIVACY_HREF} className="l-nav-link">
                Privacidad
              </Link>
              <Link href="/terms" className="l-nav-link">
                Términos
              </Link>
              <a href={CONTACT_MAILTO} className="l-nav-link">
                Contacto
              </a>
              <AppAccessButton variant="link">
                Aplicación en validación controlada
              </AppAccessButton>
            </nav>
          </div>
        </div>

        <hr className="l-divider my-8" />

        <p className="l-text text-xs leading-relaxed">
          Anclora SyncXML está en fase pre-MVP / validación controlada. Ayuda a
          revisar datos y preparar XML revisable, pero no constituye asesoramiento
          legal, no garantiza cumplimiento normativo y no acredita integración
          oficial con SES.HOSPEDAJES. El uso con datos reales requiere cerrar
          previamente seguridad, RGPD, DPA, retención y validación técnica.
        </p>
        <p className="l-text mt-2 text-xs">
          © {new Date().getFullYear()} Anclora Group · Anclora SyncXML
        </p>
      </div>
    </footer>
  );
}
