"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { themeModes } from "@/lib/preferences";
import { usePreferences } from "./AppPreferencesProvider";

const icons = { dark: Moon, light: Sun, system: Monitor };

export function ThemeToggle() {
  const { theme, setTheme, dictionary: t } = usePreferences();
  return (
    <div className="premium-toggle" role="group" aria-label={t.theme}>
      {themeModes.map((mode) => {
        const Icon = icons[mode];
        return (
          <button key={mode} type="button" className={`premium-toggle-option ${theme === mode ? "is-active" : ""}`} onClick={() => setTheme(mode)} aria-pressed={theme === mode} title={mode}>
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
