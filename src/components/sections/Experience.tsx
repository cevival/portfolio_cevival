import React, { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { Reveal, RevealText, VIEWPORT, rise } from "../motion/Reveal";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const experiences = [
  {
    role: {
      fr: "Développeur web full-stack, en alternance",
      en: "Full-stack web developer, work-study",
    },
    company: "LB Digital, Luxembourg",
    period: { fr: "Oct. 2025 – aujourd'hui", en: "Oct. 2025 – present" },
    description: {
      fr: "Développement et mise en production de sites clients en Laravel et Astro : dr-salti.lu, sasportas.lu, marque.lu, lbshop.lu, lbdigital.site, pointsrambrouch.lu et thill-loehr.lu. Intégration de maquettes, développement back-end, déploiement et maintenance.",
      en: "Building and shipping client websites in Laravel and Astro: dr-salti.lu, sasportas.lu, marque.lu, lbshop.lu, lbdigital.site, pointsrambrouch.lu and thill-loehr.lu. Design integration, back-end development, deployment and maintenance.",
    },
    tags: ["Laravel", "Astro", "Tailwind CSS", "MySQL", "SEO"],
    link: "https://lbdigital.lu/fr",
    linkLabel: "lbdigital.lu",
  },
  {
    role: {
      fr: "Développeur web, stage de 2e année",
      en: "Web developer, 2nd year internship",
    },
    company: "Synapsia",
    period: { fr: "2025", en: "2025" },
    description: {
      fr: "Conception et développement d'une application web interne de gestion des heures : authentification, saisie des temps et tableau de bord de suivi.",
      en: "Design and development of an internal time-tracking web application: authentication, time entry and a monitoring dashboard.",
    },
    tags: ["PHP", "SCSS", "MySQL"],
    link: null,
    linkLabel: null,
  },
  {
    role: {
      fr: "Développeur web, stage de 1re année",
      en: "Web developer, 1st year internship",
    },
    company: "Auto-école SC Conduite",
    period: { fr: "2024", en: "2024" },
    description: {
      fr: "Conception et réalisation du site de l'auto-école sous WordPress : création du thème, intégration des contenus, référencement et mise en ligne.",
      en: "Design and build of the driving school's website on WordPress: theme creation, content integration, SEO and deployment.",
    },
    tags: ["WordPress", "SEO"],
    link: "https://www.sconduite57100.com",
    linkLabel: "sconduite57100.com",
  },
];

export default function Experience() {
  const { lang } = useLang();
  const t = translations.experience;

  // La ligne se trace au fil du défilement, d'une station à la suivante
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: lineRef, offset: ["start 0.78", "end 0.62"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 160, damping: 30 });

  return (
    <section id="experience" className="section">
      <div className="section-inner">
        <div className="section-head">
          <h2 className="heading">
            <RevealText text={t.title[lang]} />
          </h2>
          <Reveal delay={0.15}>
            <p className="lede">{t.lede[lang]}</p>
          </Reveal>
        </div>

        <div ref={lineRef} className="line">
          <span className="line-track" aria-hidden="true">
            <motion.span className="line-fill" style={{ scaleY: drawn }} />
          </span>
          <ol>
            {experiences.map((exp, i) => (
            <motion.li
              key={exp.company}
              className={i === 0 ? "station station--now" : "station"}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT}
              transition={{ staggerChildren: 0.1 }}
            >
              <span className="station-dot" aria-hidden="true" />
              <div className="station-body">
                <motion.p variants={rise} className="meta pt-1 text-muted">
                  {exp.period[lang]}
                </motion.p>
                <motion.div variants={rise}>
                  <h3 className="text-xl font-semibold leading-snug">{exp.role[lang]}</h3>
                  <p className="mt-1 font-semibold text-accent">{exp.company}</p>
                  <p className="mt-3 text-muted">{exp.description[lang]}</p>
                  <ul className="tags mt-4">
                    {exp.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                  {exp.link && (
                    <a
                      href={exp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link mt-4 inline-flex items-center gap-1.5 text-[0.9375rem]"
                    >
                      {t.visit[lang]} {exp.linkLabel}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                </motion.div>
              </div>
            </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
