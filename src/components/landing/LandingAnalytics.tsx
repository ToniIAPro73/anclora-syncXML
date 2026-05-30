"use client";

import { useEffect } from "react";
import { track } from "./analytics";

/**
 * Mounts a single delegated click listener so server-rendered sections can
 * declare analytics events with a plain `data-track="event_name"` attribute,
 * without each section needing to become a client component.
 */
export function LandingAnalytics() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const node = target?.closest<HTMLElement>("[data-track]");
      const name = node?.dataset.track;
      if (name) track(name);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
