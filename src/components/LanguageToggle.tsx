"use client";

import { Languages } from "lucide-react";
import { languages } from "@/lib/preferences";
import { usePreferences } from "./AppPreferencesProvider";

export function LanguageToggle() {
  const { language, setLanguage, dictionary: t } = usePreferences();
  return (
    <div className="premium-toggle" role="group" aria-label={t.language}>
      <span className="flex h-7 w-7 items-center justify-center text-muted"><Languages className="h-4 w-4" /></span>
      {languages.map((item) => (
        <button key={item} type="button" className={`premium-toggle-option text-xs font-black ${language === item ? "is-active" : ""}`} onClick={() => setLanguage(item)} aria-pressed={language === item}>
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
