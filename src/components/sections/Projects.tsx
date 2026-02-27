import React, { useState, useEffect, useCallback, useRef } from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { GitHubIcon } from "../ui/brand-icons";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const THUM = (url: string) =>
  `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=630`;

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
    screenshot: THUM("https://cevival-portfolio.vercel.app"),
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
    screenshot: THUM("https://pointsrambrouch.lu"),
    featured: false,
  },
  {
    title: "LB Digita Marque",
    description: {
      fr: "Site LB Digital spécialisé dans le service de dépôt de marque au Benelux. Gestion de contenu, navigation multilingue et interface d'administration.",
      en: "LB Digital website specializing in trademark registration services in the Benelux region. Content management, multilingual navigation, and admin interface.",
    },
    tags: ["Laravel", "PHP", "MySQL", "Tailwind CSS"],
    github: null,
    demo: "https://marque.lu/fr",
    screenshot: THUM("https://marque.lu/fr"),
    featured: false,
  },
  {
    title: "LB Shop",
    description: {
      fr: "Site LB Digital spécialisé dans le service de vente (textile, papetrerie, goodies, et autre..), développé en Laravel.",
      en: "LB Digital website specializing in sales services (textiles, stationery, goodies, and more), developed in Laravel.",
    },
    tags: ["Laravel", "PHP", "MySQL", "E-commerce"],
    github: null,
    demo: "https://lbshop.lu/fr",
    screenshot: THUM("https://lbshop.lu/fr"),
    featured: false,
  },
  {
    title: "LB Digital Site",
    description: {
      fr: "Site LB Digital spécialisé dans le service de création de site internet. Présentation des services, blog et formulaires de contact.",
      en: "LB Digital website specializing in website creation services. Services presentation, blog, and contact forms.",
    },
    tags: ["Laravel", "PHP", "MySQL", "Tailwind CSS"],
    github: null,
    demo: "https://lbdigital.site/fr",
    screenshot: THUM("https://lbdigital.site/fr"),
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
    screenshot: THUM("https://thill-loehr.lu"),
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
    screenshot: THUM("https://www.sconduite57100.com"),
    featured: false,
  },
];

export default function Projects() {
  const { lang } = useLang();
  const t = translations.projects;

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = projects.length;
  const VISIBLE = 3; // cards visible at once on desktop

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(next, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, [prev, next]);

  // Build ordered list: current card is center (index 1 on desktop)
  const getVisible = () => {
    const indices: number[] = [];
    for (let i = 0; i < VISIBLE; i++) {
      indices.push((current + i) % total);
    }
    return indices;
  };

  const visibleIndices = getVisible();

  return (
    <section id="projects" className="py-24 px-6 overflow-hidden relative">
      {/* Bg grid */}
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Purple glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--primary))/0.06] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-widest mb-2">
            {t.title[lang]}
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-[hsl(var(--foreground))]">
            {t.subtitle[lang]}
          </h2>
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {projects.map((proj, i) => (
              <button
                key={proj.title}
                onClick={() => setCurrent(i)}
                aria-label={`Projet ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-8 h-2 bg-[hsl(var(--primary))] shadow-[0_0_8px_2px_hsl(var(--primary)/0.5)]"
                    : "w-2 h-2 bg-[hsl(var(--border))] hover:bg-[hsl(var(--primary)/0.5)]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Carousel container */}
        <div
          role="group"
          aria-label="Carousel de projets"
          tabIndex={-1}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Projet précédent"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -translate-x-2 md:-translate-x-6
              w-11 h-11 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))]
              flex items-center justify-center
              hover:border-[hsl(var(--primary))] hover:shadow-[0_0_12px_2px_hsl(var(--primary)/0.35)]
              transition-all duration-200 group"
          >
            <ChevronLeft className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Projet suivant"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-2 md:translate-x-6
              w-11 h-11 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))]
              flex items-center justify-center
              hover:border-[hsl(var(--primary))] hover:shadow-[0_0_12px_2px_hsl(var(--primary)/0.35)]
              transition-all duration-200 group"
          >
            <ChevronRight className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
          </button>

          {/* Cards track */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 px-8 md:px-14">
            {visibleIndices.map((projectIdx, position) => {
              const project = projects[projectIdx];
              const isCenter = position === 1;
              return (
                <div
                  key={`${projectIdx}-${position}`}
                  className={`transition-all duration-500 ${
                    isCenter
                      ? "md:scale-105 z-10"
                      : "md:scale-95 opacity-70 md:opacity-60"
                  }`}
                >
                  {/* ─── The div style you specified ─── */}
                  <div
                    className={`relative rounded-xl border border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] shadow-2xl overflow-hidden h-full flex flex-col
                      transition-all duration-300
                      ${isCenter ? "border-glow glow-primary-lg" : "hover:border-[hsl(var(--border))]"}`}
                  >
                    {/* Top accent line */}
                    <div
                      className={`h-px w-full bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent ${
                        isCenter ? "opacity-100" : "opacity-30"
                      }`}
                    />

                    {/* Card glow bg */}
                    {isCenter && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.06)] via-transparent to-[#06b6d4/0.04] pointer-events-none" />
                    )}

                    {/* Screenshot image */}
                    <div className="relative w-full h-44 overflow-hidden bg-[hsl(var(--muted))] shrink-0">
                      <img
                        src={project.screenshot}
                        alt={`Aperçu de ${project.title}`}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] via-transparent to-transparent opacity-60" />
                      {/* Browser bar overlay */}
                      <div className="absolute top-0 left-0 right-0 h-6 bg-[hsl(var(--muted)/0.8)] backdrop-blur-sm flex items-center px-3 gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400 opacity-70" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400 opacity-70" />
                        <div className="w-2 h-2 rounded-full bg-green-400 opacity-70" />
                        <div className="flex-1 mx-2 h-3 rounded bg-[hsl(var(--border))] text-[9px] text-[hsl(var(--muted-foreground))] flex items-center px-2 overflow-hidden">
                          {project.demo}
                        </div>
                      </div>
                    </div>

                    {/* Featured badge */}
                    {project.featured && (
                      <div className="px-5 pt-4 relative z-10">
                        <span className="badge-neon text-xs font-semibold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1">
                          ⭐ Featured
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col relative z-10">
                      {/* Title + counter */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-[hsl(var(--foreground))] leading-tight">
                          {project.title}
                        </h3>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] shrink-0 font-mono mt-0.5">
                          {String(projectIdx + 1).padStart(2, "0")}/
                          {String(total).padStart(2, "0")}
                        </span>
                      </div>

                      <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed flex-1 mb-4">
                        {project.description[lang]}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-md
                              bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)]
                              text-[hsl(var(--primary))] font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 mt-auto">
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                              border border-[hsl(var(--border))] bg-transparent
                              hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]
                              text-[hsl(var(--muted-foreground))] transition-all duration-200"
                          >
                            <GitHubIcon className="h-3.5 w-3.5" />
                            {t.view_code[lang]}
                          </a>
                        )}
                        {project.demo && (
                          <a
                            href={project.demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                              bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]
                              hover:shadow-[0_0_16px_-2px_hsl(var(--primary)/0.7)]
                              transition-all duration-200"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {t.view_demo[lang]}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Bottom shimmer */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Counter text */}
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-8 font-mono">
          {current + 1} / {total}
        </p>
      </div>
    </section>
  );
}
