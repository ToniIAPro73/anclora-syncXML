import Link from "next/link";
import { useLandingI18n } from "@/lib/i18n/landing";
import { CookiePreferencesButton } from "./CookiePreferencesButton";
import { CONTACT_MAILTO, PRIVACY_HREF, TERMS_HREF } from "./landingData";

export function LandingFooter() {
  const { copy } = useLandingI18n();
  const sectionLinks = [
    { label: copy.nav.product, href: "#producto" },
    { label: copy.nav.how, href: "#como-funciona" },
    { label: copy.nav.access, href: "#acceso-piloto" },
    { label: copy.nav.security, href: "#seguridad" },
  ];

  return (
    <footer id="legal-footer" className="border-t border-[color:var(--l-border)]">
      <div className="l-container py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <img
                src="/brand/logo-anclora-syncxml.png"
                alt={copy.aria.logoAlt}
                width={34}
                height={34}
                className="h-8 w-8 rounded-full"
              />
              <span className="font-heading text-base font-semibold text-white">
                Anclora SyncXML
              </span>
            </div>
            <p className="l-text mt-4 text-sm">
              {copy.footer.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <nav aria-label={copy.aria.sections} className="flex flex-col gap-3">
              <span className="l-eyebrow">{copy.footer.productLabel}</span>
              {sectionLinks.map((link) => (
                <a key={link.href} href={link.href} className="l-nav-link">
                  {link.label}
                </a>
              ))}
            </nav>

            <nav aria-label={copy.footer.legalLabel} className="flex min-w-0 flex-col items-start gap-3">
              <span className="l-eyebrow">{copy.footer.legalLabel}</span>
              <Link href="/legal" className="l-nav-link">
                {copy.common.legal}
              </Link>
              <Link href={PRIVACY_HREF} className="l-nav-link">
                {copy.trust.privacyCta}
              </Link>
              <Link href={TERMS_HREF} className="l-nav-link">
                {copy.trust.termsCta}
              </Link>
              <CookiePreferencesButton />
              <a href={CONTACT_MAILTO} className="l-nav-link">
                hola@anclora.com
              </a>
            </nav>
          </div>
        </div>

        <p className="l-text mt-8 text-xs">
          {copy.footer.languageNote}
        </p>

        <hr className="l-divider my-8" />

        <p className="l-text text-xs leading-relaxed">
          {copy.footer.disclaimer}
        </p>
        <p className="l-text mt-2 text-xs">
          {copy.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
