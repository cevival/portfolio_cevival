import React from "react";
import { MapPin, Briefcase, Languages, GraduationCap } from "lucide-react";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

export default function About() {
  const { lang } = useLang();
  const t = translations.about;

  const info = [
    { icon: MapPin, label: t.location[lang], value: t.location_val[lang] },
    { icon: Briefcase, label: t.status[lang], value: t.status_val[lang] },
    {
      icon: GraduationCap,
      label: t.formation[lang],
      value: t.formation_val[lang],
    },
    {
      icon: Languages,
      label: t.languages_label[lang],
      value: t.languages_val[lang],
    },
  ];

  return (
    <section id="about" className="py-24 px-6">
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

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Avatar placeholder */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-7xl font-bold shadow-2xl">
                GD
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    3+
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    ans exp.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed text-lg">
              {t.p1[lang]}
            </p>
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
              {t.p2[lang]}
            </p>

            {/* Info grid */}
            <div className="grid grid-cols-1 gap-4 pt-4">
              {info.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]"
                >
                  <div className="p-2 rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
