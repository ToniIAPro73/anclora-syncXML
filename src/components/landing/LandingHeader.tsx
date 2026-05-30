import Link from "next/link";
import { Menu } from "lucide-react";
import { APP_HREF, DASHBOARD_HREF, NAV_LINKS, PILOT_MAILTO } from "./landingData";

export function LandingHeader() {
  return (
    <header className="l-header">
      <div className="l-container flex items-center justify-between gap-4 py-3.5">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Anclora SyncXML — inicio">
          <img
            src="/brand/logo-anclora-syncxml.png"
            alt="Logotipo de Anclora SyncXML"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full"
          />
          <span className="font-heading text-base font-semibold tracking-tight text-white">
            Anclora SyncXML
          </span>
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="l-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href={DASHBOARD_HREF} className="l-nav-link">
            Dashboard
          </Link>
          <a href={PILOT_MAILTO} className="l-btn l-btn-secondary">
            Solicitar piloto
          </a>
          <Link href={APP_HREF} className="l-btn l-btn-primary">
            Abrir aplicación
          </Link>
        </div>

        {/* Compact, no-JS mobile menu */}
        <details className="group relative lg:hidden">
          <summary
            className="l-btn l-btn-ghost list-none px-3"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </summary>
          <div className="l-card absolute right-0 top-12 z-50 w-64 p-3">
            <nav aria-label="Secciones" className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2.5 text-sm font-semibold text-[color:var(--l-muted)] hover:bg-[color:var(--l-surface-2)] hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href={DASHBOARD_HREF}
                className="rounded-md px-3 py-2.5 text-sm font-semibold text-[color:var(--l-muted)] hover:bg-[color:var(--l-surface-2)] hover:text-white"
              >
                Dashboard
              </Link>
            </nav>
            <hr className="l-divider my-2" />
            <div className="flex flex-col gap-2">
              <a href={PILOT_MAILTO} className="l-btn l-btn-secondary w-full">
                Solicitar piloto
              </a>
              <Link href={APP_HREF} className="l-btn l-btn-primary w-full">
                Abrir aplicación
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
