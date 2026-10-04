import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Logo } from "./Logo";
import { useLang } from "../context/LangContext";
import { useTheme } from "../context/ThemeContext";
import { translations } from "../i18n/translations";
import { site } from "../data/site";

// Sections suivies pour savoir laquelle est à l'écran
const SECTION_IDS = ["top", "projects", "stack", "experience", "about", "contact"];

/** Identifiant de la section qui occupe le milieu de la fenêtre. */
function useActiveSection() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Bande fine au milieu de la fenêtre : une seule section la traverse
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}

export default function Navbar() {
  const { lang, toggle: toggleLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection();
  const t = translations.nav;

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });

  const links = [
    { id: "projects", label: t.projects[lang] },
    { id: "stack", label: t.stack[lang] },
    { id: "experience", label: t.experience[lang] },
    { id: "about", label: t.about[lang] },
  ];

  // Échap referme le menu mobile
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Le nouveau thème s'ouvre en cercle depuis le bouton (voir global.css)
  const switchTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const root = document.documentElement;
    root.style.setProperty("--vt-x", `${rect.left + rect.width / 2}px`);
    root.style.setProperty("--vt-y", `${rect.top + rect.height / 2}px`);

    if (typeof document.startViewTransition !== "function") {
      toggleTheme();
      return;
    }
    document.startViewTransition(() => flushSync(toggleTheme));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-paper">
      <nav
        aria-label={t.main[lang]}
        className="shell flex h-16 items-center justify-between gap-4 px-[var(--gutter)]"
      >
        <a
          href="#top"
          aria-label={t.home[lang]}
          className="flex items-center gap-3 font-semibold"
        >
          <Logo className="h-6 w-auto" />
          <span className="hidden sm:inline">{site.name}</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const current = active === link.id;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={current ? "true" : undefined}
                  className="nav-link"
                >
                  {current && (
                    <motion.span
                      layoutId="nav-pill"
                      className="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span>{link.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t.switch_lang[lang]}
            className="icon-btn meta !flex w-auto items-center px-2.5"
          >
            <span className={lang === "fr" ? "font-bold" : "text-muted"}>FR</span>
            <span className="px-1 text-muted" aria-hidden="true">
              /
            </span>
            <span className={lang === "en" ? "font-bold" : "text-muted"}>EN</span>
          </button>

          <button
            type="button"
            onClick={switchTheme}
            aria-label={
              theme === "dark" ? t.theme_light[lang] : t.theme_dark[lang]
            }
            className="icon-btn overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                className="flex"
                initial={{ y: 14, rotate: -60, opacity: 0 }}
                animate={{ y: 0, rotate: 0, opacity: 1 }}
                exit={{ y: -14, rotate: 60, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>

          <a
            href="#contact"
            className="btn btn--solid btn--sm hidden md:inline-flex"
          >
            {t.contact[lang]}
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t.close_menu[lang] : t.open_menu[lang]}
            className="icon-btn md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="overflow-hidden border-t border-rule px-[var(--gutter)] md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <ul>
              {links.map((link) => (
                <li key={link.id} className="border-b border-rule">
                  <a
                    href={`#${link.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3.5 text-lg font-semibold"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="btn btn--solid my-5 w-full"
            >
              {t.contact[lang]}
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        aria-hidden="true"
        className="scroll-progress"
        style={{ scaleX: progress }}
      />
    </header>
  );
}
