import React from "react";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const skillGroups = [
  {
    key: "frontend",
    skills: [
      "Astro",
      "React",
      "JavaScript",
      "TypeScript",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
    ],
  },
  {
    key: "backend",
    skills: [
      "Laravel",
      "PHP",
      "Node.js",
      "Express",
      "MySQL",
      "PostgreSQL",
      "REST API",
      "WordPress",
    ],
  },
  {
    key: "devops",
    skills: [
      "Git",
      "GitHub Actions",
      "Vercel",
      "Docker",
      "Linux",
      "CI/CD",
      "Figma",
    ],
  },
];

export default function Skills() {
  const { lang } = useLang();
  const t = translations.skills;

  return (
    <section id="skills" className="py-24 px-6 bg-[hsl(var(--muted))]/50">
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

        {/* Skills grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {skillGroups.map(({ key, skills }) => {
            const label = t[key as keyof typeof t] as Record<
              "fr" | "en",
              string
            >;
            return (
              <div
                key={key}
                className="relative p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm overflow-hidden card-hover group"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.5)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 pb-3 border-b border-[hsl(var(--border))] relative z-10">
                  {label[lang]}
                </h3>
                <div className="flex flex-wrap gap-2 relative z-10">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs px-2.5 py-0.5 rounded-full
                        bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]
                        text-[hsl(var(--primary))] font-medium
                        hover:bg-[hsl(var(--primary)/0.2)] hover:shadow-[0_0_8px_-2px_hsl(var(--primary)/0.5)]
                        transition-all duration-150 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
