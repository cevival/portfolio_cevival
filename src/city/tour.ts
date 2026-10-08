// Logique pure de la visite : aucune dépendance, ni Three.js ni DOM.

export interface Pose {
  /** Point visé */
  target: readonly [number, number, number];
  /** Angle horizontal autour de la cible, en radians (0 = caméra côté +z) */
  azimuth: number;
  /** Angle au-dessus de l'horizon, en radians */
  elevation: number;
  /** Distance caméra → cible */
  distance: number;
}

export interface TourConfig {
  overview: Pose;
  stops: readonly Pose[];
  /** Longueurs de défilement, en hauteurs de fenêtre */
  heroSpan: number;
  stopSpan: number;
  tailSpan: number;
  /** Part de chaque trajet pendant laquelle la caméra reste posée, à chaque bout */
  dwell: number;
  /** Prise de hauteur en milieu de trajet, en fraction de la distance entre cibles */
  lift: number;
}

export interface TourState {
  pose: Pose;
  /** -1 pendant le hero, sinon indice de l'arrêt */
  active: number;
  /** Opacité du texte du hero, 1 → 0 */
  heroFade: number;
  /** Opacité du panneau de visite, 0 → 1 */
  tourFade: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Départ et arrivée à vitesse nulle
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Écart angulaire signé le plus court de a vers b */
function turn(a: number, b: number) {
  const full = Math.PI * 2;
  return ((((b - a) % full) + full + Math.PI) % full) - Math.PI;
}

function blend(from: Pose, to: Pose, t: number, lift: number): Pose {
  const dx = to.target[0] - from.target[0];
  const dy = to.target[1] - from.target[1];
  const dz = to.target[2] - from.target[2];
  return {
    target: [from.target[0] + dx * t, from.target[1] + dy * t, from.target[2] + dz * t],
    azimuth: from.azimuth + turn(from.azimuth, to.azimuth) * t,
    elevation: lerp(from.elevation, to.elevation, t),
    distance:
      lerp(from.distance, to.distance, t) + lift * Math.hypot(dx, dy, dz) * Math.sin(Math.PI * t),
  };
}

/**
 * Part parcourue d'une distance de défilement, bornée à [0, 1].
 * Vaut 0 quand il n'y a rien à parcourir (section pas plus haute que son bloc
 * épinglé pendant un redimensionnement) plutôt que NaN ou l'infini.
 */
export function progressOf(done: number, total: number) {
  if (!(total > 0) || !Number.isFinite(done)) return 0;
  return clamp01(done / total);
}

/** Distance de défilement épinglée, en hauteurs de fenêtre */
export function tourLength(cfg: TourConfig) {
  return cfg.heroSpan + (cfg.stops.length - 1) * cfg.stopSpan + cfg.tailSpan;
}

/** Progression à laquelle la caméra est posée sur l'arrêt `index` */
export function stopProgress(index: number, cfg: TourConfig) {
  const i = Math.min(cfg.stops.length - 1, Math.max(0, index));
  return (cfg.heroSpan + i * cfg.stopSpan) / tourLength(cfg);
}

export function tourState(progress: number, cfg: TourConfig): TourState {
  const last = cfg.stops.length - 1;
  // Une progression non finie (section de hauteur nulle) vaut le début
  const travelled = (Number.isFinite(progress) ? clamp01(progress) : 0) * tourLength(cfg);

  // Plongée : de la vue d'ensemble au premier arrêt. Pas de pause au départ,
  // sinon le premier coup de molette ne ferait rien bouger.
  if (travelled < cfg.heroSpan) {
    const t = travelled / cfg.heroSpan;
    return {
      pose: blend(cfg.overview, cfg.stops[0], ease(clamp01(t / (1 - cfg.dwell))), 0),
      active: t < 0.72 ? -1 : 0,
      heroFade: 1 - clamp01(t / 0.45),
      tourFade: clamp01((t - 0.62) / 0.3),
    };
  }

  const along = (travelled - cfg.heroSpan) / cfg.stopSpan;
  const index = Math.min(last, Math.floor(along));
  if (index >= last) {
    return { pose: cfg.stops[last], active: last, heroFade: 0, tourFade: 1 };
  }

  const t = along - index;
  const moving = ease(clamp01((t - cfg.dwell) / (1 - 2 * cfg.dwell)));
  return {
    pose: blend(cfg.stops[index], cfg.stops[index + 1], moving, cfg.lift),
    active: t < 0.5 ? index : index + 1,
    heroFade: 0,
    tourFade: 1,
  };
}
