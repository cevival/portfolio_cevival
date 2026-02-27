export type Lang = "fr" | "en";

export const translations = {
  nav: {
    about: { fr: "À propos", en: "About" },
    skills: { fr: "Compétences", en: "Skills" },
    projects: { fr: "Projets", en: "Projects" },
    experience: { fr: "Expérience", en: "Experience" },
    contact: { fr: "Contact", en: "Contact" },
  },
  hero: {
    greeting: { fr: "Bonjour, je suis", en: "Hi, I'm" },
    title: { fr: "Développeur Full-Stack", en: "Full-Stack Developer" },
    subtitle: {
      fr: "Je conçois et développe des applications web modernes, performantes et accessibles.",
      en: "I design and build modern, performant, and accessible web applications.",
    },
    cta_projects: { fr: "Voir mes projets", en: "View my projects" },
    cta_contact: { fr: "Me contacter", en: "Contact me" },
    available: {
      fr: "Disponible pour de nouvelles opportunités",
      en: "Available for new opportunities",
    },
  },
  about: {
    title: { fr: "À propos", en: "About" },
    subtitle: { fr: "Qui suis-je ?", en: "Who am I?" },
    p1: {
      fr: "Développeur Full-Stack passionné, je crée des expériences numériques complètes, du back-end robuste aux interfaces utilisateur soignées. J'aime relever des défis techniques complexes et apporter une vraie valeur à chaque projet.",
      en: "Passionate Full-Stack Developer, I craft complete digital experiences — from solid back-end architecture to polished user interfaces. I love tackling complex technical challenges and delivering real value with every project.",
    },
    p2: {
      fr: "Curieux et en apprentissage constant, je m'intéresse aussi bien aux nouvelles technologies qu'aux bonnes pratiques du développement logiciel (clean code, tests, CI/CD).",
      en: "Curious and always learning, I keep up with new technologies and software craftsmanship best practices (clean code, testing, CI/CD).",
    },
    location: { fr: "Localisation", en: "Location" },
    location_val: { fr: "France", en: "France" },
    status: { fr: "Statut", en: "Status" },
    status_val: { fr: "Disponible", en: "Available" },
    languages_label: { fr: "Langues", en: "Languages" },
    languages_val: { fr: "Français, Anglais", en: "French, English" },
  },
  skills: {
    title: { fr: "Compétences", en: "Skills" },
    subtitle: { fr: "Ma stack technique", en: "My tech stack" },
    frontend: { fr: "Front-end", en: "Front-end" },
    backend: { fr: "Back-end", en: "Back-end" },
    devops: { fr: "DevOps & Outils", en: "DevOps & Tools" },
  },
  projects: {
    title: { fr: "Projets", en: "Projects" },
    subtitle: { fr: "Ce que j'ai construit", en: "What I've built" },
    view_code: { fr: "Code source", en: "Source code" },
    view_demo: { fr: "Démo live", en: "Live demo" },
  },
  experience: {
    title: { fr: "Expérience", en: "Experience" },
    subtitle: { fr: "Mon parcours", en: "My journey" },
    present: { fr: "Présent", en: "Present" },
  },
  contact: {
    title: { fr: "Contact", en: "Contact" },
    subtitle: { fr: "Travaillons ensemble", en: "Let's work together" },
    description: {
      fr: "Vous avez un projet en tête ? N'hésitez pas à me contacter. Je suis toujours ouvert à de nouvelles collaborations.",
      en: "Have a project in mind? Feel free to reach out. I'm always open to new collaborations.",
    },
    email_label: { fr: "Envoyer un email", en: "Send an email" },
    github_label: { fr: "Voir GitHub", en: "View GitHub" },
    linkedin_label: { fr: "LinkedIn", en: "LinkedIn" },
  },
  footer: {
    made_with: { fr: "Fait avec", en: "Made with" },
    by: { fr: "par", en: "by" },
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(section: TranslationKey, key: string, lang: Lang): string {
  const sec = translations[section] as Record<string, Record<Lang, string>>;
  return sec[key]?.[lang] ?? key;
}
