"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";
import type { LandingCopy } from "@/lib/i18n/landing";
import { PILOT_HREF } from "./landingData";
import { NAV_GROUPS, type NavGroup } from "./navigation";
import { LanguageToggle } from "./LanguageToggle";

type NavMenuCopy = LandingCopy["navMenu"];

function NavDropdown({ group, menu }: { group: NavGroup; menu: NavMenuCopy }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const groupLabel = menu.groups[group.key as keyof NavMenuCopy["groups"]];

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="l-nav-group">
      <button
        type="button"
        className="l-nav-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{groupLabel}</span>
        <ChevronDown className="h-3.5 w-3.5 transition-transform" aria-hidden="true" data-open={open} />
      </button>

      {open ? (
        <div id={panelId} className="l-nav-popover" role="menu" aria-label={groupLabel}>
          {group.items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              role="menuitem"
              className="l-nav-popover-item"
              onClick={() => setOpen(false)}
            >
              {menu.items[item.key as keyof NavMenuCopy["items"]]}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LandingHeader() {
  const { copy } = useLandingI18n();
  const menu = copy.navMenu;

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

        <nav aria-label={copy.aria.sections} className="hidden items-center gap-2 lg:flex">
          {NAV_GROUPS.map((group) => (
            <NavDropdown key={group.key} group={group} menu={menu} />
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
            <div className="l-card absolute right-0 top-12 z-50 max-h-[70vh] w-72 overflow-y-auto p-3">
              <nav aria-label={copy.aria.sections} className="flex flex-col gap-3">
                {NAV_GROUPS.map((group) => (
                  <div key={group.key} className="flex flex-col">
                    <span className="px-3 pb-1 pt-1 text-[0.7rem] font-bold uppercase tracking-wide text-[color:var(--l-gold)]">
                      {menu.groups[group.key as keyof NavMenuCopy["groups"]]}
                    </span>
                    {group.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="rounded-md px-3 py-2 text-sm font-semibold text-[color:var(--l-muted)] hover:bg-[color:var(--l-surface-2)] hover:text-white"
                      >
                        {menu.items[item.key as keyof NavMenuCopy["items"]]}
                      </a>
                    ))}
                  </div>
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
