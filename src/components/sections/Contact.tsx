import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { RevealText, rise, stagger } from "../motion/Reveal";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "../ui/brand-icons";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";
import { site } from "../../data/site";

const profiles = [
  { ...site.github, name: "GitHub", Icon: GitHubIcon },
  { ...site.linkedin, name: "LinkedIn", Icon: LinkedInIcon },
];

export default function Contact() {
  const { lang } = useLang();
  const t = translations.contact;
  const [copied, setCopied] = useState(false);

  // Les formes du bloc glissent et tournent au rythme du défilement
  const blockRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ["start end", "end start"],
  });
  const circleY = useTransform(scrollYProgress, [0, 1], [70, -50]);
  const squareRotate = useTransform(scrollYProgress, [0, 1], [-35, 145]);
  const quarterRotate = useTransform(scrollYProgress, [0, 1], [50, -20]);

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
    <section id="contact" className="band">
      <div ref={blockRef} className="contact">
        <div className="contact-shapes" aria-hidden="true">
          <motion.span className="shape shape--circle" style={{ y: circleY }} />
          <motion.span
            className="shape shape--square"
            style={{ rotate: squareRotate }}
          />
          <motion.span
            className="shape shape--quarter"
            style={{ rotate: quarterRotate }}
          />
        </div>

        <h2 className="heading">
          <RevealText text={t.title[lang]} />
        </h2>
        <motion.div {...stagger(0.1)}>
          <motion.p
            variants={rise}
            className="mt-5 max-w-[34em] text-lg text-white/85"
          >
            {t.description[lang]}
          </motion.p>
          <motion.a
            variants={rise}
            href={`mailto:${site.email}`}
            className="contact-mail mt-10"
          >
            {site.email}
          </motion.a>
        </motion.div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${site.email}`} className="btn">
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
            <span aria-live="polite">
              {copied ? t.copied[lang] : t.copy[lang]}
            </span>
          </button>
        </div>
      </div>

      <ul className="cells m-0 mt-8 list-none grid-cols-1 p-0 sm:grid-cols-2">
        {profiles.map(({ name, url, label, Icon }) => (
          <li key={name}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 transition-colors hover:bg-surface"
            >
              <Icon className="h-5 w-5 flex-none" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{name}</span>
                <span className="meta block truncate text-muted">{label}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 flex-none text-muted" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
