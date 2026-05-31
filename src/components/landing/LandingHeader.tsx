import Link from "next/link";
import { Menu } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import { PILOT_HREF } from "./landingData";
import { LanguageToggle } from "./LanguageToggle";

export function LandingHeader() {
  const { copy } = useLandingI18n();
  const navLinks = [
    { label: copy.nav.product, href: "#producto" },
    { label: copy.nav.how, href: "#como-funciona" },
    { label: copy.nav.audience, href: "#para-quien-es" },
    { label: copy.nav.access, href: "#acceso-piloto" },
    { label: copy.nav.security, href: "#seguridad" },
  ];

  return (
    <header className="l-header">
      <div className="l-container flex h-[var(--l-header-h)] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={copy.aria.home}>
          <img
            src="/brand/logo-anclora-syncxml.png"
            alt={copy.aria.logoAlt}
            width={34}
            height={34}
            className="h-8 w-8 rounded-full"
          />
          <span className="font-heading text-base font-semibold tracking-tight text-white">
            Anclora SyncXML
          </span>
        </Link>

        <nav aria-label={copy.aria.sections} className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="l-nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <Link
            href={PILOT_HREF}
            className="l-btn l-btn-primary"
            data-track="click_solicitar_piloto_controlado"
          >
            {copy.common.pilotCta}
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          {/* Compact, no-JS mobile menu */}
          <details className="group relative">
            <summary
              className="l-btn l-btn-ghost list-none px-3"
              aria-label={copy.aria.mobileMenu}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </summary>
            <div className="l-card absolute right-0 top-12 z-50 w-64 p-3">
              <nav aria-label={copy.aria.sections} className="flex flex-col">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2.5 text-sm font-semibold text-[color:var(--l-muted)] hover:bg-[color:var(--l-surface-2)] hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <hr className="l-divider my-2" />
              <Link
                href={PILOT_HREF}
                className="l-btn l-btn-primary w-full"
                data-track="click_solicitar_piloto_controlado"
              >
                {copy.common.pilotCta}
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
