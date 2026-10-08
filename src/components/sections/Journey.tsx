import React, { useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { tourConfig } from "../../city/layout";
import { tourLength } from "../../city/tour";
import { useLang } from "../../context/LangContext";
import { site } from "../../data/site";
import { tourStops, type TourStop } from "../../data/tour";
import { translations } from "../../i18n/translations";
import { useCity } from "../city/CityContext";
import { GitHubIcon, LinkedInIcon } from "../ui/brand-icons";

const socials = [
  { href: site.github.url, label: "GitHub", Icon: GitHubIcon },
  { href: site.linkedin.url, label: "LinkedIn", Icon: LinkedInIcon },
  { href: `mailto:${site.email}`, label: "E-mail", Icon: Mail },
];

const NAME_LINES = site.name.split(" ");
const two = (n: number) => String(n).padStart(2, "0");
// Rang d'apparition au chargement, porté par --i (voir .hero-fade dans global.css)
const step = (i: number) => ({ "--i": i }) as React.CSSProperties;

function Hero({ hidden }: Readonly<{ hidden: boolean }>) {
  const { lang } = useLang();
  const t = translations.hero;

  return (
    <div className="hero" inert={hidden}>
      <div className="hero-copy">
        <p className="hero-fade flex items-center gap-2.5 text-[0.9375rem] text-muted" style={step(0)}>
          <span className="live-dot live-dot--pulse" aria-hidden="true" />
          {t.available[lang]}
        </p>

        <h1 className="hero-name">
          <span className="sr-only">{site.name}</span>
          {NAME_LINES.map((line, i) => (
            <span key={line} className="hero-line" aria-hidden="true">
              <span style={step(i)}>{line}</span>
            </span>
          ))}
        </h1>

        <p className="hero-fade font-display text-2xl font-semibold sm:text-3xl" style={step(2)}>
          {t.title[lang]}
        </p>
        <p className="hero-fade lede mt-3" style={step(3)}>
          {t.tagline[lang]}
        </p>

        <div className="hero-fade mt-8 flex flex-wrap items-center gap-3" style={step(4)}>
          <a href="#projects" className="btn btn--solid">
            {t.cta_tour[lang]}
          </a>
          <a href="#contact" className="btn">
            {t.cta_contact[lang]}
          </a>
          <ul className="hero-socials">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="icon-btn h-[2.875rem] w-[2.875rem]"
                >
                  <Icon className="h-[1.125rem] w-[1.125rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span className="scroll-hint" aria-hidden="true" />
    </div>
  );
}

function StopCard({
  stop,
  index,
  active,
  hidden,
}: Readonly<{ stop: TourStop; index: number; active: boolean; hidden: boolean }>) {
  const { lang } = useLang();
  const { goToStop } = useCity();
  const t = translations.tour;
  const { project } = stop;
  const titleId = `stop-${stop.id}`;

  return (
    <article
      className="stop-card bloc"
      data-active={active}
      inert={hidden}
      aria-labelledby={titleId}
      style={{ "--tone": `var(--${stop.tone})` } as React.CSSProperties}
    >
      {/* Capture du site : affichée seulement quand la scène 3D ne tourne pas */}
      {project && (
        <img
          className="stop-shot"
          src={project.shot.src}
          srcSet={project.shot.srcSet}
          sizes="(min-width: 48rem) 24rem, 92vw"
          width={project.shot.width}
          height={project.shot.height}
          alt=""
          loading="lazy"
          decoding="async"
        />
      )}

      <div className="stop-count meta">
        <span className="flex items-center gap-2">
          <span className="stop-tone" aria-hidden="true" />
          {two(index + 1)} / {tourStops.length}
        </span>
        {/* Sur petit écran, le rail n'affiche que des points : ces boutons le relaient */}
        <span className="stop-steps">
          <button
            type="button"
            className="icon-btn"
            aria-label={t.previous[lang]}
            disabled={index === 0}
            onClick={() => goToStop(index - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={t.next[lang]}
            disabled={index === tourStops.length - 1}
            onClick={() => goToStop(index + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </span>
      </div>

      {project ? (
        <>
          <h3 id={titleId} className="stop-title">
            {project.title}
          </h3>
          <p className="stop-kind">{project.kind[lang]}</p>
          <p className="stop-text">{project.description[lang]}</p>
          <ul className="tags mt-4">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9375rem]">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link inline-flex items-center gap-1.5"
            >
              {t.visit[lang]} {project.domain}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="link inline-flex items-center gap-1.5"
              >
                <GitHubIcon className="h-3.5 w-3.5" />
                {t.code[lang]}
              </a>
            )}
          </p>
        </>
      ) : (
        <>
          <h3 id={titleId} className="stop-title">
            {t.lot_title[lang]}
          </h3>
          <p className="stop-kind">{t.lot_kind[lang]}</p>
          <p className="stop-text">{t.lot_text[lang]}</p>
          <a href="#contact" className="btn btn--solid mt-5">
            {t.lot_cta[lang]}
          </a>
        </>
      )}
    </article>
  );
}

/**
 * Hero et visite guidée : une seule section haute dont le contenu reste épinglé.
 * Le défilement fait avancer la caméra de la ville (voir CityStage), qui indique
 * en retour quel arrêt est actif.
 */
export default function Journey() {
  const { lang } = useLang();
  const { active, status, goToStop } = useCity();
  const t = translations.tour;
  const touring = active >= 0;
  // Sans scène 3D, hero et projets s'affichent à la suite : rien n'est masqué.
  // Idem avant l'hydratation, pour que la page servie reste utilisable sans JavaScript.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const staged = mounted && status !== "off";

  return (
    <section
      id="journey"
      className="journey"
      style={{ "--tour-length": tourLength(tourConfig) } as React.CSSProperties}
    >
      <span id="top" className="journey-anchor" style={{ "--at": 0 } as React.CSSProperties} />
      <span
        id="projects"
        className="journey-anchor"
        style={{ "--at": tourConfig.heroSpan } as React.CSSProperties}
      />

      <div id="journey-pin" className="journey-pin" data-phase={touring ? "tour" : "hero"}>
        <Hero hidden={staged && touring} />

        <div className="tour" inert={staged && !touring}>
          <div className="tour-inner">
            <h2 className="tour-title">{translations.projects.title[lang]}</h2>
            <nav aria-label={t.stops[lang]}>
              <ol
                className="rail"
                style={{ "--stops": tourStops.length, "--stop": Math.max(0, active) } as React.CSSProperties}
              >
                {tourStops.map((stop, i) => (
                  <li key={stop.id}>
                    <button
                      type="button"
                      className="rail-stop"
                      aria-current={i === active ? "true" : undefined}
                      data-passed={i < active}
                      onClick={() => goToStop(i)}
                    >
                      <span className="rail-dot" aria-hidden="true" />
                      <span className="rail-number" aria-hidden="true">
                        {two(i + 1)}
                      </span>
                      <span className="rail-name">{stop.project?.title ?? t.lot_title[lang]}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="stop-cards">
              {tourStops.map((stop, i) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  index={i}
                  active={i === active}
                  hidden={staged && i !== active}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Étiquettes accrochées aux bâtiments : placées par la scène, décoratives */}
        <div className="chips" aria-hidden="true">
          {tourStops.map(
            (stop) =>
              stop.featured &&
              stop.project && (
                <span key={stop.id} className="chip" data-chip={stop.id}>
                  <span className="live-dot" />
                  {stop.project.domain}
                </span>
              ),
          )}
          <span className="chip chip--lot" data-chip="lot">
            {translations.hero.next_lot[lang]}
          </span>
        </div>

        <a href="#stack" className="skip-tour" tabIndex={touring ? undefined : -1}>
          {t.skip[lang]}
        </a>
      </div>
    </section>
  );
}
