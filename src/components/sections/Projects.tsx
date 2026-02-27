import React from "react";
import { ExternalLink, Github } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const projects = [
  {
    title: "Portfolio",
    description: {
      fr: "Mon portfolio personnel construit avec Astro, React et Tailwind CSS. Design bilingue, thème auto.",
      en: "My personal portfolio built with Astro, React, and Tailwind CSS. Bilingual design, auto theme.",
    },
    tags: ["Astro", "React", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/cevival/cevival-portfolio",
    demo: "https://cevival-portfolio.vercel.app",
    featured: true,
  },
  {
    title: "API REST Node.js",
    description: {
      fr: "API RESTful complète avec authentification JWT, base PostgreSQL et documentation Swagger.",
      en: "Full RESTful API with JWT authentication, PostgreSQL database, and Swagger documentation.",
    },
    tags: ["Node.js", "Express", "PostgreSQL", "JWT", "Swagger"],
    github: "https://github.com/cevival",
    demo: null,
    featured: false,
  },
  {
    title: "Dashboard Analytics",
    description: {
      fr: "Dashboard de visualisation de données en temps réel avec Next.js et des graphiques interactifs.",
      en: "Real-time data visualization dashboard with Next.js and interactive charts.",
    },
    tags: ["Next.js", "TypeScript", "Chart.js", "Prisma"],
    github: "https://github.com/cevival",
    demo: null,
    featured: false,
  },
  {
    title: "E-commerce App",
    description: {
      fr: "Application e-commerce complète avec panier, paiement Stripe et gestion des commandes.",
      en: "Full e-commerce application with cart, Stripe payment, and order management.",
    },
    tags: ["React", "Node.js", "Stripe", "MongoDB"],
    github: "https://github.com/cevival",
    demo: null,
    featured: false,
  },
];

export default function Projects() {
  const { lang } = useLang();
  const t = translations.projects;

  return (
    <section id="projects" className="py-24 px-6">
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

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card
              key={project.title}
              className={`card-hover flex flex-col ${
                project.featured
                  ? "border-blue-500/40 dark:border-blue-500/30 shadow-blue-500/10"
                  : ""
              }`}
            >
              {/* Featured badge */}
              {project.featured && (
                <div className="px-6 pt-4">
                  <Badge variant="default" className="text-xs">
                    ⭐ Featured
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {project.description[lang]}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="tech">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="gap-3">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-4 w-4" />
                    {t.view_code[lang]}
                  </a>
                </Button>
                {project.demo && (
                  <Button size="sm" className="gap-2" asChild>
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t.view_demo[lang]}
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
