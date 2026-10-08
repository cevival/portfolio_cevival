import type Lenis from "lenis";

let lenis: Lenis | null = null;

/** Déclare (ou retire) l'instance de défilement inertiel en cours */
export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/**
 * Fait défiler la page jusqu'à `y`. Passe par Lenis quand il tourne : un
 * défilement natif lancé à côté de lui serait aussitôt contredit.
 */
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y);
  else window.scrollTo({ top: y, behavior: "smooth" });
}
