import React from "react";
import { ArrowDown, Mail, Sparkles } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "../ui/brand-icons";
import { Button } from "../ui/button";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

export default function Hero() {
  const { lang } = useLang();
  const t = translations.hero;

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-16"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[hsl(var(--primary)/0.08)] rounded-full blur-3xl animate-float"
          style={{ animationDuration: "7s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#06b6d4]/[0.06] rounded-full blur-3xl animate-float"
          style={{ animationDuration: "9s", animationDelay: "2s" }}
        />
        <div
          className="absolute top-3/4 left-1/3 w-[300px] h-[300px] bg-[#8b5cf6]/[0.04] rounded-full blur-3xl animate-float"
          style={{ animationDuration: "11s", animationDelay: "4s" }}
        />
        <div className="absolute inset-0 grid-bg opacity-40" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Available tag */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          {t.available[lang]}
        </div>

        {/* Greeting */}
        <p className="text-lg text-[hsl(var(--muted-foreground))] mb-3">
          {t.greeting[lang]}
        </p>

        {/* Name */}
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4 animate-fade-in-up"
          style={{ animationDelay: "0.3s", opacity: 0 }}
        >
          <span className="gradient-text text-glow">Guillaume</span>
          <br />
          <span className="text-[hsl(var(--foreground))]">Desplan</span>
        </h1>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(var(--muted-foreground))] mb-6">
          {t.title[lang]}
        </h2>

        {/* Subtitle */}
        <p
          className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.5s", opacity: 0 }}
        >
          {t.subtitle[lang]}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            size="lg"
            onClick={() =>
              document
                .getElementById("projects")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t.cta_projects[lang]}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            {t.cta_contact[lang]}
          </Button>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4">
          <a
            href="https://github.com/cevival"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/guillaume-desplan-36008a2a2"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedInIcon className="h-5 w-5" />
          </a>
          <a
            href="mailto:desplan.guillaume33@gmail.com"
            className="p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
            aria-label="Email"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ArrowDown className="h-5 w-5" />
      </a>
    </section>
  );
}
