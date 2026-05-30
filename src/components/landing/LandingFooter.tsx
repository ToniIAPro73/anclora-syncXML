import Link from "next/link";
import { APP_HREF, PRIVACY_HREF, TERMS_HREF } from "./landingData";

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
                width={36}
                height={36}
                className="h-9 w-9 rounded-full"
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

          <nav aria-label="Enlaces del pie" className="flex flex-col gap-3">
            <span className="l-eyebrow">Enlaces</span>
            <Link href={PRIVACY_HREF} className="l-nav-link">
              Privacidad
            </Link>
            <Link href={TERMS_HREF} className="l-nav-link">
              Términos
            </Link>
            <Link href={APP_HREF} className="l-nav-link">
              Abrir aplicación
            </Link>
          </nav>
        </div>

        <hr className="l-divider my-8" />

        <p className="l-text text-xs leading-relaxed">
          Anclora SyncXML no constituye asesoramiento legal, no garantiza
          cumplimiento normativo y no implica integración oficial automática con
          SES.HOSPEDAJES.
        </p>
        <p className="l-text mt-2 text-xs">
          © {new Date().getFullYear()} Anclora Group · Anclora SyncXML
        </p>
      </div>
    </footer>
  );
}
