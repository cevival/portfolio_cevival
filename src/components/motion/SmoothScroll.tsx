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
      // Même choix que <MotionConfig reducedMotion="never"> : par défaut, Lenis
      // coupe l'inertie et saute d'un coup aux ancres dès que le système demande
      // de réduire les animations
      respectReducedMotion: false,
    });
    setLenis(lenis);
    return () => {
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
