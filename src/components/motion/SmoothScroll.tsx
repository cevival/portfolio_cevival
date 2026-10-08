import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "../../lib/scroll";

/**
 * Défilement inertiel (Lenis). Ne rend rien.
 * Les liens d'ancre glissent jusqu'à leur section ; l'arrêt sous la barre de
 * navigation vient du `scroll-padding-top` de global.css, que Lenis respecte.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.1,
      anchors: true,
    });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
