import React, { useEffect, useLayoutEffect, useRef } from "react";
import type { CityHandle } from "../../city";
import { tourConfig } from "../../city/layout";
import { progressOf, tourState } from "../../city/tour";
import { useLang } from "../../context/LangContext";
import { useTheme } from "../../context/ThemeContext";
import { tourStops } from "../../data/tour";
import { translations } from "../../i18n/translations";
import { useCity, useCityControls } from "./CityContext";

// Décalage du sujet dans le cadre : à droite du texte sur grand écran, en haut sinon
const FRAMING_WIDE = { x: 0.19, y: 0 };
const FRAMING_NARROW = { x: 0, y: 0.17 };

function hasWebGL() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
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
      const inJourney = journeyRect.bottom > 0;
      const contactRect = contact?.getBoundingClientRect();
      const inContact = Boolean(contactRect && contactRect.top < viewport);

      if (inJourney) {
        const progress = progressOf(-journeyRect.top, journey.offsetHeight - pin.offsetHeight);
        const state = tourState(progress, tourConfig);
        // Les fondus passent par des propriétés CSS : aucun rendu React à chaque image
        pin.style.setProperty("--hero", state.heroFade.toFixed(3));
        pin.style.setProperty("--tour", state.tourFade.toFixed(3));
        if (state.active !== active) {
          active = state.active;
          setActive(active);
        }
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
        setStatus("off");
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
          // Contexte perdu : le canvas s'efface le temps qu'il revienne
          onContextChange: (lost) => setStatus(lost ? "loading" : "ready"),
        });
        cityRef.current = city;
        applyFraming();
        setStatus("ready");
      } catch (error) {
        console.error("La scène 3D n'a pas pu démarrer", error);
        setStatus("off");
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
    <div className="stage" data-status={status} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
