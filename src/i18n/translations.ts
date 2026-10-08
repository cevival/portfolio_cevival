export type Lang = "fr" | "en";

export type Localized = Record<Lang, string>;

export const translations = {
  nav: {
    projects: { fr: "Projets", en: "Projects" },
    stack: { fr: "Stack", en: "Stack" },
    experience: { fr: "Parcours", en: "Experience" },
    about: { fr: "À propos", en: "About" },
    contact: { fr: "Me contacter", en: "Contact me" },
    home: { fr: "Retour en haut de page", en: "Back to top" },
    main: { fr: "Navigation principale", en: "Main navigation" },
    open_menu: { fr: "Ouvrir le menu", en: "Open menu" },
    close_menu: { fr: "Fermer le menu", en: "Close menu" },
    switch_lang: { fr: "Switch to English", en: "Passer en français" },
    theme_dark: { fr: "Passer au thème sombre", en: "Switch to dark theme" },
    theme_light: { fr: "Passer au thème clair", en: "Switch to light theme" },
  },
  hero: {
    available: {
      fr: "Disponible pour de nouvelles opportunités",
      en: "Available for new opportunities",
    },
    title: { fr: "Développeur full-stack", en: "Full-stack developer" },
    tagline: {
      fr: "Chaque site que j'ai livré est un bâtiment de cette ville. Faites défiler pour la visiter.",
      en: "Every site I've shipped is a building in this town. Scroll to take the tour.",
    },
    cta_tour: { fr: "Commencer la visite", en: "Start the tour" },
    next_lot: { fr: "Prochain : votre projet ?", en: "Next: your project?" },
    cta_contact: { fr: "Me contacter", en: "Contact me" },
  },
  tour: {
    stops: { fr: "Arrêts de la visite", en: "Tour stops" },
    previous: { fr: "Arrêt précédent", en: "Previous stop" },
    next: { fr: "Arrêt suivant", en: "Next stop" },
    skip: { fr: "Passer la visite", en: "Skip the tour" },
    visit: { fr: "Voir", en: "Visit" },
    code: { fr: "Code source", en: "Source code" },
    lot_title: { fr: "Votre projet ?", en: "Your project?" },
    lot_kind: { fr: "Parcelle libre", en: "Vacant lot" },
    lot_text: {
      fr: "Cette parcelle est libre. Un site vitrine, une application métier, une refonte : parlons de ce que vous voulez y construire.",
      en: "This lot is free. A showcase site, a business app, a redesign: let's talk about what you want to build here.",
    },
    lot_cta: { fr: "Me contacter", en: "Contact me" },
    // Panneau du terrain dans la scène : une petite ligne, puis la grande
    lot_sign: { fr: "Prochain chantier\nVotre projet ?", en: "Next build\nYour project?" },
  },
  projects: {
    title: { fr: "Projets en production", en: "Projects in production" },
  },
  stack: {
    title: { fr: "Stack", en: "Stack" },
    lede: {
      fr: "Les technologies que j'utilise au quotidien, avec les projets sur lesquels elles tournent.",
      en: "The technologies I use day to day, and the projects they run on.",
    },
  },
  experience: {
    title: { fr: "Parcours", en: "Experience" },
    lede: {
      fr: "Deux stages, puis l'alternance chez LB Digital.",
      en: "Two internships, then a work-study contract at LB Digital.",
    },
    visit: { fr: "Voir le site", en: "Visit the site" },
  },
  about: {
    title: { fr: "À propos", en: "About" },
    portrait_alt: { fr: "Portrait de Guillaume Desplan", en: "Portrait of Guillaume Desplan" },
    p1: {
      fr: "Développeur Full-Stack en alternance chez LB Digital (Luxembourg), je suis actuellement en 3ème année de Bachelor Informatique à la Metz Numeric School. Je conçois et développe des applications web complètes, du back-end (Laravel, Node.js) aux interfaces modernes (React, Astro, Tailwind CSS).",
      en: "Full-Stack Developer on a work-study contract at LB Digital (Luxembourg), currently in my 3rd year of a Computer Science Bachelor's at Metz Numeric School. I design and build complete web applications, from the back end (Laravel, Node.js) to modern front ends (React, Astro, Tailwind CSS).",
    },
    p2: {
      fr: "Passionné par les nouvelles technologies et les bonnes pratiques (clean code, CI/CD, performance), j'ai déjà livré plusieurs sites en production pour des clients réels au Luxembourg et en France.",
      en: "Passionate about new technologies and best practices (clean code, CI/CD, performance), I have already delivered several production sites for real clients in Luxembourg and France.",
    },
    location: { fr: "Localisation", en: "Location" },
    location_val: { fr: "Metz, France", en: "Metz, France" },
    status: { fr: "Statut", en: "Status" },
    status_val: {
      fr: "Alternant chez LB Digital",
      en: "Apprentice at LB Digital",
    },
    formation: { fr: "Formation", en: "Education" },
    formation_val: {
      fr: "Bachelor Informatique, Metz Numeric School",
      en: "Computer Science Bachelor, Metz Numeric School",
    },
    languages_label: { fr: "Langues", en: "Languages" },
    languages_val: { fr: "Français, anglais", en: "French, English" },
  },
  contact: {
    title: { fr: "Travaillons ensemble", en: "Let's work together" },
    description: {
      fr: "Vous avez un projet en tête ? N'hésitez pas à me contacter. Je suis toujours ouvert à de nouvelles collaborations.",
      en: "Have a project in mind? Feel free to reach out. I'm always open to new collaborations.",
    },
    copy: { fr: "Copier l'adresse", en: "Copy address" },
    copied: { fr: "Adresse copiée", en: "Address copied" },
    write: { fr: "Écrire un e-mail", en: "Write an email" },
  },
  footer: {
    built: {
      fr: "Construit avec Astro, React, Three.js et Tailwind CSS. Hébergé sur Vercel.",
      en: "Built with Astro, React, Three.js and Tailwind CSS. Hosted on Vercel.",
    },
  },
} as const;
