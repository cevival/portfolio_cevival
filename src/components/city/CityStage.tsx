import React, { useEffect, useLayoutEffect, useRef } from "react";
import type { CityHandle } from "../../city";
import { tourConfig } from "../../city/layout";
import posterDarkTall from "../../assets/city/poster-dark-tall.webp";
import posterDarkWide from "../../assets/city/poster-dark-wide.webp";
import posterLightTall from "../../assets/city/poster-light-tall.webp";
import posterLightWide from "../../assets/city/poster-light-wide.webp";
import { progressOf, tourState } from "../../city/tour";
import { useLang } from "../../context/LangContext";
import { useTheme } from "../../context/ThemeContext";
import { tourStops } from "../../data/tour";
import { scrollToY } from "../../lib/scroll";
import { translations } from "../../i18n/translations";
import { useCity, useCityControls } from "./CityContext";

// Décalage du sujet dans le cadre : à droite du texte sur grand écran, en haut sinon
const FRAMING_WIDE = { x: 0.19, y: 0 };
const FRAMING_NARROW = { x: 0, y: 0.17 };
// Délai laissé au navigateur pour rendre un contexte WebGL perdu
const CONTEXT_GRACE_MS = 4000;

// Images de la ville tirées de la scène, au même cadrage : affichées tout de
// suite, puis recouvertes par le canvas. Le CSS choisit selon le thème et la
// largeur ; seule celle qui sert est téléchargée.
const posters = {
  "--poster-dark-wide": `url(${posterDarkWide.src})`,
  "--poster-dark-tall": `url(${posterDarkTall.src})`,
  "--poster-light-wide": `url(${posterLightWide.src})`,
  "--poster-light-tall": `url(${posterLightTall.src})`,
} as React.CSSProperties;

function hasWebGL() {
  try {
    const probe = document.createElement("canvas");
    // WebGL 2 seulement : Three.js ne démarre plus avec moins
    const gl = probe.getContext("webgl2");
    // Le contexte de test est rendu tout de suite : leur nombre est limité
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Le canvas de la ville, fixe derrière la page, et la boucle qui relie le
 * défilement à la scène : elle mesure la section visite et la section contact,
 * en déduit la vue, et ne prévient React que lorsque l'arrêt actif change.
 */
export function CityStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cityRef = useRef<CityHandle | null>(null);
  const { status } = useCity();
  const { setStatus, setActive } = useCityControls();
  const { theme } = useTheme();
  const { lang } = useLang();
  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    const canvas = canvasRef.current;
    const journey = document.getElementById("journey");
    const pin = document.getElementById("journey-pin");
    if (!canvas || !journey || !pin) return;

    const contact = document.getElementById("contact");
    const chips = Array.from(pin.querySelectorAll<HTMLElement>("[data-chip]"));
    const wide = window.matchMedia("(min-width: 64rem)");
    let city: CityHandle | null = null;
    let disposed = false;
    let raf = 0;
    // Valeur impossible : le premier passage publie toujours l'arrêt actif
    let active = Number.NaN;
    // Mode de repli : plus de scène, hero et projets en liste classique
    let off = false;
    let lostTimer = 0;
    // Où en est la visite, et sur quelle distance elle se déroule
    let progressNow = 0;
    let pinnedBefore = journey.offsetHeight - pin.offsetHeight;

    const publish = (next: number) => {
      if (next === active) return;
      active = next;
      setActive(next);
    };

    const turnOff = () => {
      if (off) return;
      off = true;
      // La mise en page de repli n'est plus pilotée par le défilement
      pin.style.removeProperty("--hero");
      pin.style.removeProperty("--tour");
      pin.removeAttribute("data-hero-out");
      city?.dispose();
      city = null;
      cityRef.current = null;
      setStatus("off");
    };

    const applyFraming = () => {
      const framing = wide.matches ? FRAMING_WIDE : FRAMING_NARROW;
      city?.setFraming(framing.x, framing.y);
    };

    const placeChips = () => {
      if (!city) return;
      for (const chip of chips) {
        const at = city.project(`label:${chip.dataset.chip}`);
        if (!at?.visible) {
          chip.dataset.placed = "false";
          continue;
        }
        chip.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
        chip.dataset.placed = "true";
      }
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const viewport = window.innerHeight;
      const journeyRect = journey.getBoundingClientRect();
      if (off) {
        // Seule la navigation a besoin de savoir si l'on a dépassé le hero
        publish(journeyRect.top < -viewport * 0.6 ? 0 : -1);
        return;
      }
      // La section se mesure en hauteurs de fenêtre, le défilement en pixels :
      // quand la fenêtre change de taille, le même défilement tomberait sur un
      // autre arrêt. On se replace là où la visite en était, avant de mesurer.
      const pinned = journey.offsetHeight - pin.offsetHeight;
      if (Math.abs(pinned - pinnedBefore) > 1) {
        const touring = progressNow > 0 && progressNow < 1;
        pinnedBefore = pinned;
        if (touring) {
          scrollToY(journeyRect.top + window.scrollY + progressNow * pinned, true);
          return;
        }
      }
      const inJourney = journeyRect.bottom > 0;
      const contactRect = contact?.getBoundingClientRect();
      const inContact = Boolean(contactRect && contactRect.top < viewport);

      // L'état de la visite se calcule même quand elle est plus haut que l'écran
      // (lien profond, page rechargée plus bas) : sinon le hero resterait actif
      // et la visite inerte, à l'inverse de ce qu'on trouve en remontant. Une
      // fois la visite dépassée la progression vaut 1 : rien à replacer au
      // redimensionnement.
      const progress = progressOf(-journeyRect.top, pinned);
      progressNow = progress;
      const state = tourState(progress, tourConfig);
      // Les fondus passent par des propriétés CSS : aucun rendu React à chaque image
      pin.style.setProperty("--hero", state.heroFade.toFixed(3));
      pin.style.setProperty("--tour", state.tourFade.toFixed(3));
      // Effacé avant que le premier arrêt ne prenne le relais : ni clic ni focus sur du texte invisible
      pin.toggleAttribute("data-hero-out", state.heroFade === 0);
      publish(state.active);

      if (inJourney) {
        city?.setView({ kind: "journey", progress });
        if (state.heroFade > 0) placeChips();
      } else if (contactRect && inContact) {
        city?.setView({
          kind: "finale",
          progress: progressOf(viewport - contactRect.top, contactRect.height),
        });
      }

      // Sous le rideau, personne ne voit la ville : rien à dessiner
      if (inJourney || inContact) city?.start();
      else city?.stop();
    };

    const boot = async () => {
      if (disposed) return;
      if (!hasWebGL()) {
        turnOff();
        return;
      }
      try {
        const { createCity } = await import("../../city");
        if (disposed) return;
        city = createCity({
          canvas,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          lotLabel: translations.tour.lot_sign[langRef.current],
          stops: tourStops.map(({ id, project }) => ({
            id,
            title: project?.title ?? "",
            domain: project?.domain,
            screen: project && { small: project.shot.small, large: project.shot.src },
          })),
          // Contexte perdu : le canvas s'efface le temps qu'il revienne ; s'il ne
          // revient pas, la page passe en mode de repli.
          onContextChange: (lost) => {
            window.clearTimeout(lostTimer);
            if (lost) lostTimer = window.setTimeout(turnOff, CONTEXT_GRACE_MS);
            setStatus(lost ? "loading" : "ready");
          },
        });
        cityRef.current = city;
        applyFraming();
        setStatus("ready");
      } catch (error) {
        console.error("La scène 3D n'a pas pu démarrer", error);
        turnOff();
      }
    };

    const resize = new ResizeObserver(() => {
      city?.resize();
      applyFraming();
    });
    resize.observe(canvas);
    wide.addEventListener("change", applyFraming);

    raf = requestAnimationFrame(frame);
    // Three.js se charge une fois la page affichée et le navigateur disponible
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(() => void boot(), { timeout: 1200 })
        : window.setTimeout(() => void boot(), 1);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(lostTimer);
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      resize.disconnect();
      wide.removeEventListener("change", applyFraming);
      city?.dispose();
      cityRef.current = null;
    };
  }, [setActive, setStatus]);

  // Dans un effet de mise en page : la bascule de thème en cercle prend un
  // instantané de la page, la scène doit déjà y être au nouveau thème.
  useLayoutEffect(() => {
    const instant = typeof document.startViewTransition === "function";
    cityRef.current?.setTheme(theme, !instant);
  }, [theme]);

  useEffect(() => {
    cityRef.current?.setLotLabel(translations.tour.lot_sign[lang]);
  }, [lang]);

  return (
    <div className="stage" data-status={status} style={posters} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
