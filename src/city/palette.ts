// Couleurs de la ville, de jour et de nuit. Données pures, sans Three.js.

export type Theme = "light" | "dark";

/** Couleur d'accent d'un projet, tirée de la stack (Astro/PHP, Laravel, TypeScript, JavaScript). */
export type Tone = "violet" | "rouge" | "bleu" | "jaune";

const TONES: readonly Tone[] = ["violet", "rouge", "bleu", "jaune"];

/** Couleur de l'arrêt n° `index` : les quatre couleurs de la stack, à tour de rôle */
export const toneAt = (index: number): Tone => TONES[index % TONES.length];

/** Chaque maillage porte un rôle ; changer de thème, c'est recolorer les rôles. */
export type Role =
  | "slab"
  | "slabSide"
  | "road"
  | "roadMark"
  | "pavement"
  | "grass"
  | "wall"
  | "wallAlt"
  | "wallDark"
  | "trim"
  | "roof"
  | "glass"
  | "violet"
  | "rouge"
  | "jaune"
  | "bleu"
  | "vert"
  | "trunk"
  | "foliage"
  | "foliageAlt"
  | "metal"
  | "dark"
  | "white";

export interface Palette {
  /** Fond de page, fond de scène et brouillard : la scène se fond dans la page */
  paper: number;
  /** Grille du sol lointain */
  rule: number;
  roles: Record<Role, number>;
  /** Lumière d'ambiance : ciel, sol, intensité */
  sky: number;
  groundLight: number;
  hemisphere: number;
  /** Lumière directionnelle (soleil ou lune) */
  sun: number;
  sunIntensity: number;
  /** Opacité de l'ombre portée du socle sur la page */
  shadow: number;
  /** Teintes des fenêtres allumées et éteintes */
  windowLit: readonly number[];
  windowOff: readonly number[];
  /** Part de fenêtres allumées quand le bâtiment n'est pas l'arrêt actif */
  litShare: number;
  /** Opacité des halos de lampadaire */
  halo: number;
  /** Luminosité d'un écran géant inactif (1 = pleine) */
  screenIdle: number;
}

export const palettes: Record<Theme, Palette> = {
  // Nuit : les violets du thème sombre, des fenêtres chaudes pour seul contraste
  dark: {
    paper: 0x0f0d1a,
    rule: 0x2a2642,
    roles: {
      slab: 0x1c1833,
      slabSide: 0x2d2752,
      road: 0x131022,
      roadMark: 0x5d5790,
      pavement: 0x272143,
      grass: 0x1f2c47,
      wall: 0x463f78,
      wallAlt: 0x5a5294,
      wallDark: 0x322c58,
      trim: 0x7a72b8,
      roof: 0x2a2450,
      glass: 0x241f45,
      violet: 0x7a62ff,
      rouge: 0xff6a55,
      jaune: 0xf7df1e,
      bleu: 0x5b9be0,
      vert: 0x4cc27f,
      trunk: 0x3a3158,
      foliage: 0x6a52e0,
      foliageAlt: 0x9a78ff,
      metal: 0x8a84b8,
      dark: 0x0c0a16,
      white: 0xe9e6fb,
    },
    sky: 0xe9e4ff,
    groundLight: 0x6f67a8,
    hemisphere: 1.9,
    sun: 0xffffff,
    sunIntensity: 1.45,
    shadow: 0.55,
    windowLit: [0xffd66b, 0xf7df1e, 0xffbf73],
    windowOff: [0x1e1846, 0x2a2452],
    litShare: 0.4,
    halo: 0.6,
    screenIdle: 0.4,
  },
  // Jour : papier lilas, murs blancs, toits aux couleurs de la stack
  light: {
    paper: 0xf8f6ff,
    rule: 0xdcd7f0,
    roles: {
      slab: 0xefebff,
      slabSide: 0xc9c1ee,
      road: 0xcdc6ec,
      roadMark: 0xffffff,
      pavement: 0xfaf9ff,
      grass: 0xcdebd6,
      wall: 0xffffff,
      wallAlt: 0xe9e4ff,
      wallDark: 0xcfc8ee,
      trim: 0xb3aae6,
      roof: 0xa99cf0,
      glass: 0xa9c0ff,
      violet: 0x5a3ee6,
      rouge: 0xf4442e,
      jaune: 0xf7df1e,
      bleu: 0x3178c6,
      vert: 0x3fb873,
      trunk: 0x8a7a9c,
      foliage: 0x6fc08a,
      foliageAlt: 0xd6ea72,
      metal: 0x9f9abc,
      dark: 0x16132a,
      white: 0xffffff,
    },
    sky: 0xffffff,
    groundLight: 0xd9d1ff,
    hemisphere: 1.8,
    sun: 0xfff6e8,
    sunIntensity: 1.7,
    shadow: 0.2,
    windowLit: [0xa9c0ff, 0x8fb0ff, 0xc5d4ff],
    windowOff: [0xa9c0ff, 0x9bb6ff],
    litShare: 1,
    halo: 0,
    screenIdle: 0.92,
  },
};
