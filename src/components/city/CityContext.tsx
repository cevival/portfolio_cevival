import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { tourConfig } from "../../city/layout";
import { stopProgress } from "../../city/tour";
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

export function CityProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [status, setStatus] = useState<CityStatus>("loading");
  const [active, setActive] = useState(-1);

  // La mise en page de repli se déclenche en CSS, sur l'attribut de <html>
  useEffect(() => {
    const root = document.documentElement;
    if (status === "off") root.dataset.city = "off";
    else delete root.dataset.city;
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
