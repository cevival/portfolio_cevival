// Plan de la ville et poses de caméra. Données pures : ce module est importé
// par le bundle initial (rail, boucle de scroll), il ne doit pas dépendre de Three.js.
import { progressOf, type Pose, type TourConfig } from "./tour";

/** Les arrêts, dans l'ordre de la visite : les 11 projets puis le terrain à bâtir. */
export const STOP_IDS = [
  "qualitrack",
  "dr-salti",
  "sasportas",
  "points-rambrouch",
  "thill-loehr",
  "jour-de-rien",
  "marque",
  "lbshop",
  "lbdigital-site",
  "sc-conduite",
  "portfolio",
  "lot",
] as const;

export type StopId = (typeof STOP_IDS)[number];

const COLS = 4;
const ROWS = 3;
const LOT_W = 13;
const LOT_D = 12;
const ROAD = 3.2;
// Bordure du socle au-delà des rues de ceinture
const EDGE = 1.2;

export const CITY = {
  cols: COLS,
  rows: ROWS,
  lotW: LOT_W,
  lotD: LOT_D,
  road: ROAD,
  /** Dimensions du socle, rues de ceinture et bordure comprises */
  width: COLS * LOT_W + (COLS + 1) * ROAD + 2 * EDGE,
  depth: ROWS * LOT_D + (ROWS + 1) * ROAD + 2 * EDGE,
  thickness: 1.6,
  /** Hauteur de la dalle d'une parcelle : les bâtiments sont posés dessus */
  plate: 0.14,
} as const;

export interface Lot {
  id: StopId;
  col: number;
  row: number;
  /** Centre de la parcelle */
  x: number;
  z: number;
}

// La visite serpente : rangée du fond de gauche à droite, rangée du milieu de
// droite à gauche, rangée de devant de gauche à droite. Deux arrêts consécutifs
// sont donc toujours voisins, et la caméra ne fait que de petits sauts.
export const LOTS: readonly Lot[] = STOP_IDS.map((id, i) => {
  const row = Math.floor(i / COLS);
  const step = i % COLS;
  const col = row % 2 === 0 ? step : COLS - 1 - step;
  return {
    id,
    col,
    row,
    x: (col - (COLS - 1) / 2) * (LOT_W + ROAD),
    z: (row - (ROWS - 1) / 2) * (LOT_D + ROAD),
  };
});

const rad = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Point de vue de chaque arrêt : azimut et élévation en degrés, distance, et
 * hauteur du point visé. L'azimut alterne pour que la caméra tourne un peu
 * autour de la ville d'un arrêt à l'autre.
 */
const VIEWS: Record<StopId, { az: number; el: number; dist: number; y: number }> = {
  qualitrack: { az: 40, el: 31, dist: 52, y: 7.6 },
  "dr-salti": { az: 52, el: 34, dist: 38, y: 4.4 },
  sasportas: { az: 36, el: 34, dist: 38, y: 4.2 },
  "points-rambrouch": { az: 54, el: 34, dist: 40, y: 5 },
  "thill-loehr": { az: 38, el: 33, dist: 41, y: 5 },
  "jour-de-rien": { az: 50, el: 34, dist: 42, y: 5.6 },
  marque: { az: 34, el: 34, dist: 42, y: 5.6 },
  lbshop: { az: 56, el: 34, dist: 38, y: 4.4 },
  "lbdigital-site": { az: 40, el: 34, dist: 38, y: 4.4 },
  "sc-conduite": { az: 54, el: 34, dist: 38, y: 4.4 },
  portfolio: { az: 36, el: 34, dist: 40, y: 4.8 },
  lot: { az: 48, el: 33, dist: 42, y: 5 },
};

const CENTER: Pose["target"] = [0, 2, 0];

export const tourConfig: TourConfig = {
  overview: { target: CENTER, azimuth: rad(45), elevation: rad(36), distance: 185 },
  stops: LOTS.map((lot) => {
    const view = VIEWS[lot.id];
    return {
      target: [lot.x, view.y, lot.z],
      azimuth: rad(view.az),
      elevation: rad(view.el),
      distance: view.dist,
    };
  }),
  heroSpan: 1,
  stopSpan: 0.5,
  tailSpan: 0.5,
  dwell: 0.2,
  lift: 0.35,
};

/** Plan final, derrière la section contact : la caméra recule en tournant un peu. */
export function finalePose(progress: number): Pose {
  const t = progressOf(progress, 1);
  return {
    target: CENTER,
    azimuth: rad(62 - 32 * t),
    elevation: rad(26 + 10 * t),
    distance: 110 + 55 * t,
  };
}
