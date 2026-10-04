import type { Localized } from "../i18n/translations";
import type { BrandIconName } from "./stack-icons";

export interface Tech {
  name: string;
  /** Absent quand la marque n'a pas de logo libre : une pastille à initiale le remplace */
  icon?: BrandIconName;
  /** Où et pour quoi la techno est utilisée */
  usage: Localized;
}

export interface TechGroup {
  label: Localized;
  items: Tech[];
}

export const stack: TechGroup[] = [
  {
    label: { fr: "Langages", en: "Languages" },
    items: [
      {
        name: "TypeScript",
        icon: "typescript",
        usage: { fr: "Dr Salti, ce portfolio", en: "Dr Salti, this portfolio" },
      },
      {
        name: "JavaScript",
        icon: "javascript",
        usage: { fr: "Point S Rambrouch, QualiTrack", en: "Point S Rambrouch, QualiTrack" },
      },
      {
        name: "PHP",
        icon: "php",
        usage: { fr: "QualiTrack, sites LB Digital", en: "QualiTrack, LB Digital sites" },
      },
      {
        name: "HTML5",
        icon: "html5",
        usage: { fr: "Intégration sémantique, SEO", en: "Semantic markup, SEO" },
      },
      {
        name: "CSS",
        icon: "css",
        usage: { fr: "Dr Salti, en CSS natif", en: "Dr Salti, in plain CSS" },
      },
    ],
  },
  {
    label: { fr: "Front-end", en: "Front end" },
    items: [
      {
        name: "Astro",
        icon: "astro",
        usage: { fr: "Dr Salti, Point S Rambrouch", en: "Dr Salti, Point S Rambrouch" },
      },
      {
        name: "React",
        icon: "react",
        usage: { fr: "Dr Sasportas, Un Jour de Rien", en: "Dr Sasportas, Un Jour de Rien" },
      },
      {
        name: "Vite",
        icon: "vite",
        usage: { fr: "QualiTrack, Dr Sasportas", en: "QualiTrack, Dr Sasportas" },
      },
      {
        name: "Tailwind CSS",
        icon: "tailwind",
        usage: { fr: "QualiTrack, Dr Sasportas", en: "QualiTrack, Dr Sasportas" },
      },
      {
        name: "Inertia.js",
        icon: "inertia",
        usage: { fr: "Dr Sasportas, Un Jour de Rien", en: "Dr Sasportas, Un Jour de Rien" },
      },
      {
        name: "Alpine.js",
        icon: "alpine",
        usage: { fr: "QualiTrack", en: "QualiTrack" },
      },
    ],
  },
  {
    label: { fr: "Back-end", en: "Back end" },
    items: [
      {
        name: "Laravel",
        icon: "laravel",
        usage: { fr: "QualiTrack, Dr Sasportas, LB Shop", en: "QualiTrack, Dr Sasportas, LB Shop" },
      },
      {
        name: "Symfony",
        icon: "symfony",
        usage: { fr: "Site principal de LB Digital", en: "LB Digital's main site" },
      },
      {
        name: "Node.js",
        icon: "node",
        usage: { fr: "Outillage, scripts de build", en: "Tooling, build scripts" },
      },
      {
        name: "Express",
        icon: "express",
        usage: { fr: "API REST en Node.js", en: "REST APIs on Node.js" },
      },
      {
        name: "MySQL",
        icon: "mysql",
        usage: { fr: "QualiTrack, LB Shop", en: "QualiTrack, LB Shop" },
      },
      {
        name: "PostgreSQL",
        icon: "postgresql",
        usage: { fr: "Bases relationnelles", en: "Relational databases" },
      },
      {
        name: "WordPress",
        icon: "wordpress",
        usage: { fr: "SC Conduite", en: "SC Conduite" },
      },
    ],
  },
  {
    label: { fr: "Outils et qualité", en: "Tools and quality" },
    items: [
      {
        name: "Git",
        icon: "git",
        usage: { fr: "Commits atomiques, branches", en: "Atomic commits, branches" },
      },
      {
        name: "GitHub Actions",
        icon: "githubActions",
        usage: { fr: "CI/CD de ce portfolio", en: "CI/CD for this portfolio" },
      },
      {
        name: "Docker",
        icon: "docker",
        usage: { fr: "Environnements de QualiTrack", en: "QualiTrack environments" },
      },
      {
        name: "Pest",
        usage: { fr: "Plus de 450 tests sur QualiTrack", en: "450+ tests on QualiTrack" },
      },
      {
        name: "Stripe",
        icon: "stripe",
        usage: { fr: "Abonnements de QualiTrack", en: "QualiTrack subscriptions" },
      },
      {
        name: "Linux",
        icon: "linux",
        usage: { fr: "Serveurs et déploiement", en: "Servers and deployment" },
      },
      {
        name: "Vercel",
        icon: "vercel",
        usage: { fr: "Hébergement de ce portfolio", en: "Hosting for this portfolio" },
      },
      {
        name: "Figma",
        icon: "figma",
        usage: { fr: "Intégration de maquettes", en: "Design handoff" },
      },
    ],
  },
];
