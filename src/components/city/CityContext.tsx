import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { tourConfig } from "../../city/layout";
import { placeOf, stopProgress, type Place } from "../../city/tour";
import { scrollToY } from "../../lib/scroll";

/**
 * `loading` : la scène 3D n'est pas (ou plus) affichée ; `ready` : elle tourne ;
 * `off` : pas de WebGL, la page retombe sur la liste classique des projets.
 */
export type CityStatus = "loading" | "ready" | "off";

interface CityValue {
  status: CityStatus;
  /** Arrêt en cours de visite, -1 tant qu'on est sur le hero */
  active: number;
  /** Fait défiler la page jusqu'à l'arrêt `index` */
  goToStop(index: number): void;
}

interface CityControls {
  setStatus(status: CityStatus): void;
  setActive(active: number): void;
}

const CityContext = createContext<CityValue>({
  status: "loading",
  active: -1,
  goToStop: () => {},
});

const CityControlsContext = createContext<CityControls>({
  setStatus: () => {},
  setActive: () => {},
});

/** Hauteur gardée libre sous la barre de navigation : le `scroll-padding-top` de la page */
function navClearance() {
  return Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
}

/** Ce que le lecteur a sous les yeux, mesuré sur la section de la visite */
function readPlace(): Place {
  const journey = document.getElementById("journey");
  const pin = document.getElementById("journey-pin");
  if (!journey || !pin) return { kind: "hero" };
  return placeOf(
    -journey.getBoundingClientRect().top,
    journey.offsetHeight,
    pin.offsetHeight,
    tourConfig,
    navClearance(),
  );
}

/** Ramène sous les yeux du lecteur ce qu'il lisait, une fois la visite repliée en liste */
function restorePlace(place: Place) {
  const journey = document.getElementById("journey");
  if (!journey || place.kind === "hero") return;
  if (place.kind === "after") {
    scrollToY(journey.getBoundingClientRect().bottom + window.scrollY + place.past, true);
    return;
  }
  // Le premier arrêt ouvre la liste : on la montre depuis son titre
  const target =
    place.index === 0
      ? journey.querySelector(".tour")
      : journey.querySelectorAll(".stop-card")[place.index];
  if (target) scrollToY(target.getBoundingClientRect().top + window.scrollY - navClearance(), true);
}

export function CityProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [status, setStatus] = useState<CityStatus>("loading");
  const [active, setActive] = useState(-1);

  // La mise en page de repli se déclenche en CSS, sur l'attribut de <html>. Elle
  // raccourcit la page de plusieurs écrans : on replace le lecteur devant ce
  // qu'il lisait, dans le même temps, avant que le navigateur ne peigne.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (status !== "off") {
      delete root.dataset.city;
      return;
    }
    if (root.dataset.city === "off") return;
    const place = readPlace();
    root.dataset.city = "off";
    restorePlace(place);
  }, [status]);

  const goToStop = useCallback((index: number) => {
    const journey = document.getElementById("journey");
    const pin = document.getElementById("journey-pin");
    if (!journey || !pin) return;
    const pinned = journey.offsetHeight - pin.offsetHeight;
    const top = journey.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + stopProgress(index, tourConfig) * pinned);
  }, []);

  const value = useMemo(() => ({ status, active, goToStop }), [status, active, goToStop]);
  const controls = useMemo(() => ({ setStatus, setActive }), []);

  return (
    <CityControlsContext.Provider value={controls}>
      <CityContext.Provider value={value}>{children}</CityContext.Provider>
    </CityControlsContext.Provider>
  );
}

export function useCity() {
  return useContext(CityContext);
}

/** Réservé à la scène : c'est elle qui sait où en est la visite */
export function useCityControls() {
  return useContext(CityControlsContext);
}
