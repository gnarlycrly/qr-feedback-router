import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = {
  appPrimary: string;
  appAccent: string;
  appBg?: string;
  appForeground?: string;
  appSurface?: string;
};

const DEFAULT_THEME: Theme = {
  appPrimary: "#1A3673",
  appAccent: "#2563eb",
  appBg: "#f8fafc",
  appForeground: "#0f172a",
  appSurface: "#E8EDF2",
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Partial<Theme>) => void;
  resetTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ab_theme");
      if (raw) {
        const parsed = JSON.parse(raw);
        setThemeState((s) => ({ ...s, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // apply CSS variables whenever theme changes
    try {
      document.documentElement.style.setProperty("--app-primary", theme.appPrimary);
      document.documentElement.style.setProperty("--app-accent", theme.appAccent);
      if (theme.appBg) document.documentElement.style.setProperty("--app-bg", theme.appBg);
      if (theme.appForeground) document.documentElement.style.setProperty("--app-foreground", theme.appForeground);
      if (theme.appSurface) document.documentElement.style.setProperty("--app-surface", theme.appSurface);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const setTheme = (t: Partial<Theme>) => {
    setThemeState((prev) => {
      const next = { ...prev, ...t };
      try {
        localStorage.setItem("ab_theme", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const resetTheme = () => {
    setThemeState(DEFAULT_THEME);
    try {
      localStorage.removeItem("ab_theme");
    } catch (e) {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export default ThemeProvider;
