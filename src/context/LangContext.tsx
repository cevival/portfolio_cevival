import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { Lang } from "../i18n/translations";

interface LangContextType {
  lang: Lang;
  toggle: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: "fr",
  toggle: () => {},
});

export function LangProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const stored = localStorage.getItem("portfolio-lang") as Lang | null;
    if (stored === "fr" || stored === "en") setLang(stored);
  }, []);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "fr" ? "en" : "fr";
      localStorage.setItem("portfolio-lang", next);
      return next;
    });
  }, []);

  const contextValue = useMemo(() => ({ lang, toggle }), [lang, toggle]);

  return (
    <LangContext.Provider value={contextValue}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
