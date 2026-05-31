"use client";

import Link from "next/link";
import { LandingLocaleProvider, useLandingI18n } from "@/lib/i18n/landing";
import { CookieConsent } from "./CookieConsent";
import { FloatingCookieButton } from "./FloatingCookieButton";

export function CookiesPageContent() {
  return (
    <LandingLocaleProvider>
      <CookiesPageInner />
    </LandingLocaleProvider>
  );
}

function CookiesPageInner() {
  const { copy } = useLandingI18n();
  return (
    <div className="landing-root min-h-screen">
      <main className="l-container py-16">
        <section className="l-card l-card-gold p-8">
          <span className="l-eyebrow">{copy.cookies.page.eyebrow}</span>
          <h1 className="l-h1 mt-4">{copy.cookies.page.title}</h1>
          <p className="l-text mt-5 max-w-2xl">{copy.cookies.page.intro}</p>
          {copy.cookies.page.sections.map(([title, body]) => (
            <p key={title} className="l-text mt-4 max-w-2xl">
              {body}
            </p>
          ))}
          <Link href="/" className="l-btn l-btn-secondary mt-8">
            {copy.cookies.page.back}
          </Link>
        </section>
      </main>
      <FloatingCookieButton />
      <CookieConsent />
    </div>
  );
}
