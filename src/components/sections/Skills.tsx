import React from "react";
import { Badge } from "../ui/badge";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const skillGroups = [
  {
    key: "frontend",
    skills: [
      "React",
      "Next.js",
      "Astro",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
      "HTML5",
      "CSS3",
      "Vue.js",
    ],
  },
  {
    key: "backend",
    skills: [
      "Node.js",
      "Express",
      "NestJS",
      "Python",
      "FastAPI",
      "PostgreSQL",
      "MongoDB",
      "Prisma",
      "REST API",
      "GraphQL",
    ],
  },
  {
    key: "devops",
    skills: [
      "Git",
      "GitHub Actions",
      "Docker",
      "Vercel",
      "Linux",
      "CI/CD",
      "Jest",
      "Vitest",
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
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
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
                className="p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-sm"
              >
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 pb-3 border-b border-[hsl(var(--border))]">
                  {label[lang]}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="tech">
                      {skill}
                    </Badge>
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
