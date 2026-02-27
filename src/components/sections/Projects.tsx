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
    title: "Portfolio Personnel",
    description: {
      fr: "Mon portfolio one-page construit avec Astro, React et Tailwind CSS. Design bilingue FR/EN, thème dark/light automatique, déployé sur Vercel via GitHub Actions.",
      en: "My one-page portfolio built with Astro, React, and Tailwind CSS. Bilingual FR/EN, auto dark/light theme, deployed on Vercel via GitHub Actions.",
    },
    tags: ["Astro", "React", "TypeScript", "Tailwind CSS", "GitHub Actions"],
    github: "https://github.com/cevival/cevival-portfolio",
    demo: "https://cevival-portfolio.vercel.app",
    featured: true,
  },
  {
    title: "Points Rambrouch",
    description: {
      fr: "Site vitrine pour la commune de Rambrouch (Luxembourg), développé avec Astro. Navigation fluide, design moderne et performances optimisées.",
      en: "Showcase website for the municipality of Rambrouch (Luxembourg), built with Astro. Smooth navigation, modern design, and optimized performance.",
    },
    tags: ["Astro", "Tailwind CSS", "JavaScript"],
    github: null,
    demo: "https://pointsrambrouch.lu",
    featured: false,
  },
  {
    title: "Marque.lu",
    description: {
      fr: "Plateforme de marques luxembourgeoises développée en Laravel. Gestion de contenu, navigation multilingue et interface d'administration.",
      en: "Luxembourg brands platform developed with Laravel. Content management, multilingual navigation, and admin interface.",
    },
    tags: ["Laravel", "PHP", "MySQL", "Tailwind CSS"],
    github: null,
    demo: "https://marque.lu/fr",
    featured: false,
  },
  {
    title: "LB Shop",
    description: {
      fr: "Site e-commerce luxembourgeois en Laravel. Catalogue produits, gestion commandes et interface multilingue.",
      en: "Luxembourg e-commerce site in Laravel. Product catalog, order management, and multilingual interface.",
    },
    tags: ["Laravel", "PHP", "MySQL", "E-commerce"],
    github: null,
    demo: "https://lbshop.lu/fr",
    featured: false,
  },
  {
    title: "LB Digital",
    description: {
      fr: "Site institutionnel de l'agence LB Digital (Luxembourg) en Laravel. Présentation des services, blog et formulaires de contact.",
      en: "Institutional website of LB Digital agency (Luxembourg) in Laravel. Services presentation, blog, and contact forms.",
    },
    tags: ["Laravel", "PHP", "MySQL", "Tailwind CSS"],
    github: null,
    demo: "https://lbdigital.site/fr",
    featured: false,
  },
  {
    title: "Thill-Loehr",
    description: {
      fr: "Site professionnel luxembourgeois développé en Laravel. Intégration maquette, gestion de contenu et déploiement en production.",
      en: "Luxembourg professional website developed with Laravel. Design integration, content management, and production deployment.",
    },
    tags: ["Laravel", "PHP", "MySQL"],
    github: null,
    demo: "https://thill-loehr.lu",
    featured: false,
  },
  {
    title: "SC Conduite (stage 1ère année)",
    description: {
      fr: "Site web de l'auto-école SC Conduite réalisé sous WordPress lors de mon 1er stage. Thème personnalisé, référencement et mise en ligne.",
      en: "Website for the SC Conduite driving school, made with WordPress during my 1st internship. Custom theme, SEO, and deployment.",
    },
    tags: ["WordPress", "PHP", "CSS3", "SEO"],
    github: null,
    demo: "https://www.sconduite57100.com",
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {project.github && (
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
                )}
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
