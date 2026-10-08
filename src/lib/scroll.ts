import type Lenis from "lenis";

let lenis: Lenis | null = null;

/** Déclare (ou retire) l'instance de défilement inertiel en cours */
export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/**
 * Fait défiler la page jusqu'à `y`, en glissant ou d'un coup (`immediate`).
 * Passe par Lenis quand il tourne : un défilement natif lancé à côté de lui
 * serait aussitôt contredit.
 */
export function scrollToY(y: number, immediate = false) {
  if (lenis) lenis.scrollTo(y, { immediate });
  else window.scrollTo({ top: y, behavior: immediate ? "instant" : "smooth" });
}
