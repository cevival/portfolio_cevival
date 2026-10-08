import type { Localized } from "../i18n/translations";

export interface Shot {
  src: string;
  /** Version 640 px */
  small: string;
  srcSet: string;
  width: number;
  height: number;
}

export interface Project {
  slug: string;
  title: string;
  kind: Localized;
  description: Localized;
  tags: string[];
  url: string;
  /** Domaine tel qu'affiché dans la barre d'adresse et les liens */
  domain: string;
  github?: string;
  shot: Shot;
}

interface ImageMeta {
  src: string;
  width: number;
  height: number;
}

// Captures prises sur les sites en ligne, en 1280 px et 640 px (suffixe -sm)
const images = import.meta.glob<ImageMeta>("../assets/projects/*.webp", {
  eager: true,
  import: "default",
});

function shot(slug: string): Shot {
  const large = images[`../assets/projects/${slug}.webp`];
  const small = images[`../assets/projects/${slug}-sm.webp`];
  if (!large || !small) throw new Error(`Capture manquante : ${slug}`);
  return {
    src: large.src,
    small: small.src,
    srcSet: `${small.src} ${small.width}w, ${large.src} ${large.width}w`,
    width: large.width,
    height: large.height,
  };
}

const client: Localized = {
  fr: "Client de LB Digital",
  en: "LB Digital client",
};

const agency: Localized = {
  fr: "Site de l'agence LB Digital",
  en: "LB Digital agency site",
};

/** Les trois projets mis en avant : premiers arrêts de la visite, étiquetés sur le hero. */
export const featured: Project[] = [
  {
    slug: "qualitrack",
    title: "QualiTrack",
    kind: { fr: "Projet de formation, SaaS", en: "Training project, SaaS" },
    description: {
      fr: "Plateforme de management de la qualité : indicateurs, audits, non-conformités et actions correctives. Comptes multi-organisations, abonnements Stripe intégrés à l'application, API REST documentée et plus de 450 tests automatisés.",
      en: "Quality management platform: KPIs, audits, non-conformities and corrective actions. Multi-organisation accounts, Stripe subscriptions built into the app, a documented REST API and more than 450 automated tests.",
    },
    tags: ["Laravel 12", "PHP", "MySQL", "Alpine.js", "Tailwind CSS", "Vite", "Stripe", "Docker"],
    url: "https://qualitrack-app.fr",
    domain: "qualitrack-app.fr",
    shot: shot("qualitrack"),
  },
  {
    slug: "dr-salti",
    title: "Dr Salti",
    kind: client,
    description: {
      fr: "Site du cabinet dentaire du Dr Salti, à Dudelange et Junglinster. Astro statique, polices auto-hébergées et aucune requête tierce avant le consentement : Google Maps se charge au clic, reCAPTCHA au premier focus du formulaire. Données structurées pour le référencement et formulaire relié à un mailer PHP.",
      en: "Website for Dr Salti's dental practice in Dudelange and Junglinster. Static Astro, self-hosted fonts and no third-party request before consent: Google Maps loads on click, reCAPTCHA on first form focus. Structured data for SEO and a contact form wired to a PHP mailer.",
    },
    tags: ["Astro 7", "TypeScript", "PHP", "SEO", "RGPD"],
    url: "https://dr-salti.lu",
    domain: "dr-salti.lu",
    shot: shot("dr-salti"),
  },
  {
    slug: "sasportas",
    title: "Dr Sasportas",
    kind: client,
    description: {
      fr: "Site vitrine et blog du cabinet dentaire du Dr Sasportas, à Dudelange. Une application Laravel avec une interface React servie par Inertia : prestations, articles, prise de rendez-vous et avis des patients.",
      en: "Showcase website and blog for Dr Sasportas's dental practice in Dudelange. A Laravel application with a React front end served through Inertia: treatments, articles, appointment booking and patient reviews.",
    },
    tags: ["Laravel 13", "React 19", "Inertia.js", "Tailwind CSS", "Vite"],
    url: "https://sasportas.lu",
    domain: "sasportas.lu",
    shot: shot("sasportas"),
  },
];

export const more: Project[] = [
  {
    slug: "points-rambrouch",
    title: "Point S Rambrouch",
    kind: client,
    description: {
      fr: "Site vitrine du garage Point S de Rambrouch (Luxembourg), développé avec Astro. Navigation fluide et performances optimisées.",
      en: "Showcase website for the Point S garage in Rambrouch (Luxembourg), built with Astro. Smooth navigation and optimised performance.",
    },
    tags: ["Astro", "Tailwind CSS", "JavaScript"],
    url: "https://pointsrambrouch.lu",
    domain: "pointsrambrouch.lu",
    shot: shot("points-rambrouch"),
  },
  {
    slug: "thill-loehr",
    title: "Thill-Loehr",
    kind: client,
    description: {
      fr: "Site professionnel luxembourgeois développé en Laravel. Intégration de la maquette, gestion de contenu et déploiement en production.",
      en: "Luxembourg professional website built with Laravel. Design integration, content management and production deployment.",
    },
    tags: ["Laravel", "PHP", "MySQL"],
    url: "https://thill-loehr.lu",
    domain: "thill-loehr.lu",
    shot: shot("thill-loehr"),
  },
  {
    slug: "jour-de-rien",
    title: "Un Jour de Rien",
    kind: { fr: "Site d'une pièce de théâtre", en: "Theatre play website" },
    description: {
      fr: "Site de présentation d'une pièce de théâtre avec back-office complet : articles, page À propos, équipe et réservation en ligne.",
      en: "Website for a theatre play with a full back office: articles, About page, team and online booking.",
    },
    tags: ["Laravel", "Inertia.js", "React", "Tailwind CSS"],
    url: "https://jourderien.fr",
    domain: "jourderien.fr",
    shot: shot("jour-de-rien"),
  },
  {
    slug: "marque",
    title: "LB Digital Marque",
    kind: agency,
    description: {
      fr: "Site de LB Digital dédié au dépôt de marque au Benelux. Gestion de contenu, navigation multilingue et interface d'administration.",
      en: "LB Digital's website for trademark registration in the Benelux. Content management, multilingual navigation and an admin interface.",
    },
    tags: ["Laravel", "PHP", "MySQL", "Tailwind CSS"],
    url: "https://marque.lu/fr",
    domain: "marque.lu",
    shot: shot("marque"),
  },
  {
    slug: "lbshop",
    title: "LB Shop",
    kind: agency,
    description: {
      fr: "Boutique de LB Digital : textile, papeterie, goodies et objets publicitaires personnalisés, développée en Laravel.",
      en: "LB Digital's shop: textiles, stationery, goodies and custom promotional items, built with Laravel.",
    },
    tags: ["Laravel", "PHP", "MySQL", "E-commerce"],
    url: "https://lbshop.lu/fr",
    domain: "lbshop.lu",
    shot: shot("lbshop"),
  },
  {
    slug: "lbdigital-site",
    title: "LB Digital Site",
    kind: agency,
    description: {
      fr: "Site de LB Digital dédié à la création de sites internet : présentation des services, blog et formulaires de contact.",
      en: "LB Digital's website for web design services: services overview, blog and contact forms.",
    },
    tags: ["Laravel", "PHP", "MySQL", "Tailwind CSS"],
    url: "https://lbdigital.site/fr",
    domain: "lbdigital.site",
    shot: shot("lbdigital-site"),
  },
  {
    slug: "sc-conduite",
    title: "SC Conduite",
    kind: { fr: "Stage de 1re année", en: "1st year internship" },
    description: {
      fr: "Site de l'auto-école SC Conduite, réalisé sous WordPress lors de mon premier stage. Thème personnalisé, référencement et mise en ligne.",
      en: "Website for the SC Conduite driving school, made with WordPress during my first internship. Custom theme, SEO and deployment.",
    },
    tags: ["WordPress", "PHP", "CSS", "SEO"],
    url: "https://www.sconduite57100.com",
    domain: "sconduite57100.com",
    shot: shot("sc-conduite"),
  },
  {
    slug: "portfolio",
    title: "Ce portfolio",
    kind: { fr: "Projet personnel", en: "Personal project" },
    description: {
      fr: "Portfolio one-page construit avec Astro, React et Three.js : une ville en 3D dont la caméra voyage au défilement, chaque bâtiment étant un site livré. Bilingue, de jour ou de nuit, déployé sur Vercel via GitHub Actions.",
      en: "One-page portfolio built with Astro, React and Three.js: a 3D town whose camera travels as you scroll, each building being a shipped site. Bilingual, by day or by night, deployed on Vercel through GitHub Actions.",
    },
    tags: ["Astro", "React", "Three.js", "TypeScript", "Tailwind CSS"],
    url: "https://guillaume-desplan.vercel.app",
    domain: "guillaume-desplan.vercel.app",
    github: "https://github.com/cevival/portfolio_cevival",
    shot: shot("portfolio"),
  },
];
