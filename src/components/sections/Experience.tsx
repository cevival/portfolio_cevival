import React from "react";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const experiences = [
  {
    role: {
      fr: "Développeur Web Full-Stack (Alternance)",
      en: "Full-Stack Web Developer (Apprenticeship)",
    },
    company: "LB Digital — Luxembourg",
    period: { fr: "Oct. 2025 – Présent", en: "Oct. 2025 – Present" },
    description: {
      fr: "Développement et mise en production de plusieurs sites clients en Laravel et Astro. Réalisation de marque.lu, lbshop.lu, lbdigital.site, pointsrambrouch.lu et thill-loehr.lu. Intégration de maquettes, développement back-end, déploiement et maintenance.",
      en: "Development and production deployment of multiple client websites in Laravel and Astro. Delivered marque.lu, lbshop.lu, lbdigital.site, pointsrambrouch.lu, and thill-loehr.lu. UI integration, back-end development, deployment, and maintenance.",
    },
    tags: ["Laravel", "Astro", "Tailwind CSS", "MySQL", "SEO"],
    link: "https://lbdigital.lu/fr",
  },
  {
    role: {
      fr: "Développeur Web (Stage 2ème année)",
      en: "Web Developer (2nd Year Internship)",
    },
    company: "Synapsia",
    period: { fr: "2025", en: "2025" },
    description: {
      fr: "Conception et développement d'une web app interne de gestion des heures pour l'entreprise. Application complète avec authentification, saisie des temps et tableau de bord de suivi.",
      en: "Design and development of an internal time-tracking web application for the company. Full app with authentication, time entry, and monitoring dashboard.",
    },
    tags: ["PHP", "SCSS", "MysSQL"],
    link: null,
  },
  {
    role: {
      fr: "Développeur Web (Stage 1ère année)",
      en: "Web Developer (1st Year Internship)",
    },
    company: "Auto-école SC Conduite",
    period: { fr: "2024", en: "2024" },
    description: {
      fr: "Conception et réalisation du site web de l'auto-école sous WordPress. Création du thème, intégration des contenus, référencement et mise en ligne.",
      en: "Design and development of the driving school website using WordPress. Theme creation, content integration, SEO, and deployment.",
    },
    tags: ["WordPress", "SEO"],
    link: "https://www.sconduite57100.com",
  },
];

export default function Experience() {
  const { lang } = useLang();
  const t = translations.experience;

  return (
    <section id="experience" className="py-24 px-6 bg-[hsl(var(--muted))]/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">
            {t.title[lang]}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">
            {t.subtitle[lang]}
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-transparent" />

          <div className="space-y-10">
            {experiences.map((exp, i) => (
              <div key={i} className="relative pl-20">
                {/* Dot */}
                <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-[hsl(var(--primary))] border-4 border-[hsl(var(--background))] shadow-md -translate-x-1/2 shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]" />

                {/* Card */}
                <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm card-hover">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">
                        {exp.role[lang]}
                      </h3>
                      <p className="text-[hsl(var(--primary))] font-medium text-sm">
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] px-3 py-1 rounded-full whitespace-nowrap">
                      {exp.period[lang]}
                    </span>
                  </div>

                  <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed mb-4">
                    {exp.description[lang]}
                  </p>

                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {exp.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {exp.link && (
                      <a
                        href={exp.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
                      >
                        Voir le site →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
