import React from "react";
import { Mail, Github, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const contactLinks = [
  {
    icon: Mail,
    label_key: "email_label",
    href: "mailto:desplan.guillaume33@gmail.com",
    display: "desplan.guillaume33@gmail.com",
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: Github,
    label_key: "github_label",
    href: "https://github.com/cevival",
    display: "github.com/cevival",
    color: "text-[hsl(var(--foreground))]",
    bg: "bg-[hsl(var(--muted))]",
  },
  {
    icon: Linkedin,
    label_key: "linkedin_label",
    href: "https://www.linkedin.com/in/guillaume-desplan",
    display: "linkedin.com/in/guillaume-desplan",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
];

export default function Contact() {
  const { lang } = useLang();
  const t = translations.contact;

  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[hsl(var(--primary))] uppercase tracking-wider mb-2">
            {t.title[lang]}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            {t.subtitle[lang]}
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
            {t.description[lang]}
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid gap-4 max-w-lg mx-auto mb-10">
          {contactLinks.map(
            ({ icon: Icon, label_key, href, display, color, bg }) => (
              <a
                key={href}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.3)] transition-all group card-hover"
              >
                <div className={`p-3 rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mb-0.5">
                    {(t as any)[label_key][lang]}
                  </p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                    {display}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-1 transition-all" />
              </a>
            ),
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="gap-2" asChild>
            <a href="mailto:desplan.guillaume33@gmail.com">
              <Mail className="h-4 w-4" />
              {t.email_label[lang]}
            </a>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 pt-8 border-t border-[hsl(var(--border))] text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {translations.footer.made_with[lang]}{" "}
          <span className="text-red-500">♥</span> {translations.footer.by[lang]}{" "}
          <span className="font-semibold text-[hsl(var(--foreground))]">
            Guillaume Desplan
          </span>
          {" · "}
          <span>Astro + React + Tailwind + shadcn/ui</span>
        </p>
      </footer>
    </section>
  );
}
