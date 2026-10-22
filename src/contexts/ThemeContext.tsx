"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type Theme = "light" | "dark";

export const THEME_KEY = "andinoh-customer:theme";

/**
 * Runs in <head> before the first paint so a saved dark theme never flashes white.
 * Kept as a string because it runs before React loads.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var p=localStorage.getItem('${THEME_KEY}');var d=p==='dark'||((!p||p==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');}catch(e){}})();`;

interface ThemeContextType {
  /** What the person chose. */
  preference: ThemePreference;
  /** What's showing (the system's choice when preference is "system"). */
  theme: Theme;
  setPreference: (p: ThemePreference) => void;
  /** Light ↔ dark, from whatever is showing now. */
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ preference: "system", theme: "light", setPreference: () => {}, toggle: () => {} });

function readPreference(): ThemePreference {
  try {
    const p = localStorage.getItem(THEME_KEY);
    return p === "light" || p === "dark" ? p : "system";
  } catch { return "system"; }
}

const systemTheme = (): Theme =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/** Light, dark or the system's setting; saved per browser (same behaviour as the admin app). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPref] = useState<ThemePreference>("system");
  const [system, setSystem] = useState<Theme>("light");

  // Browser-only state: read once mounted (the head script has already applied it to the page).
  useEffect(() => {
    setPref(readPreference()); // eslint-disable-line react-hooks/set-state-in-effect
    setSystem(systemTheme());
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => setSystem(mq.matches ? "dark" : "light");
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  const theme: Theme = preference === "system" ? system : preference;

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPref(p);
    try { if (p === "system") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, p); } catch { /* private mode */ }
  }, []);
  const toggle = useCallback(() => setPreference(theme === "dark" ? "light" : "dark"), [theme, setPreference]);

  return <ThemeContext.Provider value={{ preference, theme, setPreference, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
