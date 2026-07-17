import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial smooth scrolling (Lenis, as used by incredibles.dev and most
 * award-winning sites). Renders nothing; disabled for reduced motion.
 * `anchors: true` makes #hash navigation glide instead of jumping.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true,
    });
    // Exposed so buttons can trigger inertial scrolling programmatically
    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, []);

  return null;
}
