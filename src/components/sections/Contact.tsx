import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { RevealText, rise, stagger } from "../motion/Reveal";
import { GitHubIcon, LinkedInIcon } from "../ui/brand-icons";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";
import { site } from "../../data/site";

const profiles = [
  { ...site.github, name: "GitHub", Icon: GitHubIcon },
  { ...site.linkedin, name: "LinkedIn", Icon: LinkedInIcon },
];

/**
 * Dernière section : le rideau se termine au-dessus d'elle et la ville
 * réapparaît derrière, entièrement allumée (voir CityStage, vue « finale »).
 */
export default function Contact() {
  const { lang } = useLang();
  const t = translations.contact;
  const [copied, setCopied] = useState(false);

  // Le bouton revient à « Copier l'adresse » après deux secondes
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : on ouvre le client mail
      globalThis.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section id="contact" className="finale">
      <div className="finale-inner">
        <div className="finale-card bloc">
          <h2 className="heading">
            <RevealText text={t.title[lang]} />
          </h2>
          <motion.div {...stagger(0.1)}>
            <motion.p variants={rise} className="mt-4 text-muted">
              {t.description[lang]}
            </motion.p>
            <motion.a variants={rise} href={`mailto:${site.email}`} className="contact-mail mt-6">
              {site.email}
            </motion.a>
          </motion.div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`mailto:${site.email}`} className="btn btn--solid">
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t.write[lang]}
            </a>
            <button type="button" onClick={copyEmail} className="btn">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "done" : "idle"}
                  className="flex"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 24 }}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </motion.span>
              </AnimatePresence>
              <span aria-live="polite">{copied ? t.copied[lang] : t.copy[lang]}</span>
            </button>
          </div>

          <ul className="profiles">
            {profiles.map(({ name, url, label, Icon }) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <Icon className="h-5 w-5 flex-none" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-tight">{name}</span>
                    <span className="meta block truncate text-muted">{label}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 flex-none text-muted" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
