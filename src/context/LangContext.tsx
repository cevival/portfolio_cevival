import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { Lang } from "../i18n/translations";
import { readPreference, writePreference } from "../lib/storage";

interface LangContextType {
  lang: Lang;
  toggle: () => void;
}

const LangContext = createContext<LangContextType>({
  lang: "fr",
  toggle: () => {},
});

export function LangProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const stored = readPreference("portfolio-lang");
    if (stored === "fr" || stored === "en") setLang(stored);
  }, []);

  // Garde <html lang> aligné sur la langue affichée (lecteurs d'écran, césure)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "fr" ? "en" : "fr";
      writePreference("portfolio-lang", next);
      return next;
    });
  }, []);

  const contextValue = useMemo(() => ({ lang, toggle }), [lang, toggle]);

  return (
    <LangContext.Provider value={contextValue}>{children}</LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
