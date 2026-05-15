"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextValue = {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  toggle: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "gooroomee-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDarkState] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved === "light") setIsDarkState(false);
    else if (saved === "dark") setIsDarkState(true);
    // saved 없으면 기본값 false(라이트) 유지
    setMounted(true);
  }, []);

  const setIsDark = (v: boolean) => {
    setIsDarkState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "dark" : "light");
    } catch {
      /* SSR or storage disabled */
    }
  };
  const toggle = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, toggle, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // 컨텍스트 외부에서 사용 시 안전한 기본값
    return { isDark: false, setIsDark: () => {}, toggle: () => {}, mounted: false };
  }
  return ctx;
}
