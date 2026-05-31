"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLandingI18n } from "@/lib/i18n/landing";

const SECTION_IDS = [
  "hero",
  "producto",
  "como-funciona",
  "para-quien-es",
  "acceso-piloto",
  "seguridad",
  "legal-footer",
] as const;

export function SectionNavigator() {
  const { copy } = useLandingI18n();
  const sections = useMemo(() => SECTION_IDS, []);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const elements = sections
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target.id) return;
        const index = sections.indexOf(visible.target.id as (typeof SECTION_IDS)[number]);
        if (index >= 0) setActiveIndex(index);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(index: number) {
    const target = document.getElementById(sections[index]);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= sections.length - 1;

  return (
    <nav className="l-section-nav" aria-label={copy.aria.sectionNav}>
      {!isFirst ? (
        <button type="button" onClick={() => scrollTo(activeIndex - 1)} aria-label={copy.aria.previousSection}>
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
      {!isLast ? (
        <button type="button" onClick={() => scrollTo(activeIndex + 1)} aria-label={copy.aria.nextSection}>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </nav>
  );
}
