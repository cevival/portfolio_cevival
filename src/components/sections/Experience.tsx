import React from "react";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const experiences = [
  {
    role: { fr: "Développeur Full-Stack", en: "Full-Stack Developer" },
    company: "Freelance",
    period: { fr: "2023 – Présent", en: "2023 – Present" },
    description: {
      fr: "Conception et développement d'applications web sur mesure pour divers clients. Architecture back-end, intégration d'API et interfaces utilisateur modernes.",
      en: "Design and development of custom web applications for various clients. Back-end architecture, API integration, and modern user interfaces.",
    },
    tags: ["React", "Node.js", "PostgreSQL", "Vercel"],
  },
  {
    role: { fr: "Développeur Front-end", en: "Front-end Developer" },
    company: "Startup Tech",
    period: { fr: "2022 – 2023", en: "2022 – 2023" },
    description: {
      fr: "Développement de l'interface utilisateur d'une plateforme SaaS. Collaboration en équipe Agile, revues de code et amélioration des performances.",
      en: "Development of the user interface for a SaaS platform. Agile team collaboration, code reviews, and performance improvements.",
    },
    tags: ["Vue.js", "TypeScript", "Tailwind CSS", "REST API"],
  },
  {
    role: {
      fr: "Alternant Développeur Web",
      en: "Web Developer (Apprenticeship)",
    },
    company: "Agence Web",
    period: { fr: "2020 – 2022", en: "2020 – 2022" },
    description: {
      fr: "Développement de sites web pour des PME. Création de thèmes WordPress, intégration de maquettes et maintenance applicative.",
      en: "Website development for SMBs. WordPress theme creation, design integration, and application maintenance.",
    },
    tags: ["WordPress", "JavaScript", "PHP", "CSS3"],
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
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
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
                <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-400 border-4 border-[hsl(var(--background))] shadow-md -translate-x-1/2" />

                {/* Card */}
                <div className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm card-hover">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">
                        {exp.role[lang]}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
