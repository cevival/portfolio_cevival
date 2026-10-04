import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Défilement inertiel (Lenis). Ne rend rien.
 * Les liens d'ancre glissent jusqu'à leur section ; l'arrêt sous l'en-tête
 * fixe vient du `scroll-padding-top` de global.css, que Lenis respecte.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      anchors: true,
    });
    return () => lenis.destroy();
  }, []);

  return null;
}
