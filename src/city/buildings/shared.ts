// Ce que tous les bâtiments partagent : le contexte de construction et
// quelques éléments récurrents (volume à fenêtres, arbre, voiture, plaque).
import { Group, type Mesh, type Object3D } from "three";
import type { Kit } from "../kit";
import type { Role, Tone } from "../palette";
import type { Screens } from "../screens";
import { label, type Sign, type Signs } from "../signs";
import type { Windows } from "../windows";

export interface BuildContext {
  kit: Kit;
  windows: Windows;
  signs: Signs;
  screens: Screens;
  lotIndex: number;
  tone: Tone;
  /** Nom du projet, écrit sur l'enseigne */
  title: string;
  /** Azimut de la caméra à cet arrêt : l'écran géant lui fait face */
  facing: number;
  /** Texte du panneau du terrain à bâtir (deux lignes séparées par un saut de ligne) */
  lotLabel: string;
}

/**
 * Construit une parcelle. Le groupe rendu est centré sur la parcelle, posé sur
 * sa dalle : x de -6,5 à 6,5, z de -6 à 6. La caméra ne voit que les faces
 * avant (+z) et droite (+x).
 */
export type Builder = (ctx: BuildContext) => Group;

export const FRONT = 0;
export const RIGHT = Math.PI / 2;

export interface Panes {
  cols: number;
  rows: number;
  /** Hauteur sans fenêtres en bas et en haut du mur */
  base?: number;
  top?: number;
  /** Marge sans fenêtres sur les côtés */
  inset?: number;
  front?: boolean;
  right?: boolean;
}

/** Volume plein, avec des fenêtres sur ses deux faces visibles */
export function block(
  ctx: BuildContext,
  parent: Object3D,
  role: Role,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  panes?: Panes,
): Mesh {
  const mesh = ctx.kit.box(parent, role, w, h, d, x, y, z);
  if (!panes) return mesh;

  const base = panes.base ?? 0.6;
  const top = panes.top ?? 0.5;
  const inset = panes.inset ?? 0.5;
  const zone = h - base - top;
  const pitchY = zone / panes.rows;

  const face = (width: number, cols: number, gx: number, gz: number, rotY: number) => {
    const pitchX = (width - inset * 2) / cols;
    ctx.windows.grid(ctx.lotIndex, parent, {
      x: gx,
      y: y + base + zone / 2,
      z: gz,
      rotY,
      cols,
      rows: panes.rows,
      w: pitchX * 0.6,
      h: pitchY * 0.62,
      gapX: pitchX * 0.4,
      gapY: pitchY * 0.38,
    });
  };

  if (panes.front !== false) face(w, panes.cols, x, z + d / 2, FRONT);
  if (panes.right !== false) {
    face(d, Math.max(1, Math.round((panes.cols * d) / w)), x + w / 2, z, RIGHT);
  }
  return mesh;
}

/** Plaque au nom du projet, plaquée sur un mur */
export function nameplate(
  ctx: BuildContext,
  parent: Object3D,
  w: number,
  x: number,
  y: number,
  z: number,
  rotY = FRONT,
  text = ctx.title,
): Sign {
  const out = 0.05;
  return ctx.signs.plate(ctx.lotIndex, parent, label(text), {
    x: x + Math.sin(rotY) * out,
    y,
    z: z + Math.cos(rotY) * out,
    rotY,
    w,
    h: w * 0.2,
    tone: ctx.tone,
  });
}

/** Écran géant du projet, posé sur un toit plat ou au sol, tourné vers la caméra */
export function screen(ctx: BuildContext, parent: Object3D, x: number, y: number, z: number, legs = 0.7, width?: number) {
  ctx.screens.mount(ctx.lotIndex, parent, ctx.tone, { x, y, z, rotY: ctx.facing, legs, width });
}

export function tree(kit: Kit, parent: Object3D, x: number, z: number, size = 1, kind: "round" | "pine" = "round") {
  if (kind === "pine") {
    kit.cyl(parent, "trunk", 0.12 * size, 0.16 * size, 0.7 * size, x, 0, z, 6);
    kit.cone(parent, "foliage", 0.9 * size, 1.5 * size, x, 0.55 * size, z, 7);
    kit.cone(parent, "foliage", 0.65 * size, 1.25 * size, x, 1.45 * size, z, 7);
    return;
  }
  kit.cyl(parent, "trunk", 0.1 * size, 0.15 * size, 1.15 * size, x, 0, z, 6);
  kit.blob(parent, "foliage", 0.85 * size, x, 0.85 * size, z);
  kit.blob(parent, "foliageAlt", 0.52 * size, x + 0.5 * size, 1.55 * size, z + 0.25 * size);
}

export function bush(kit: Kit, parent: Object3D, x: number, z: number, size = 1, y = 0) {
  kit.blob(parent, "foliage", 0.42 * size, x, y - 0.1 * size, z);
  kit.blob(parent, "foliageAlt", 0.3 * size, x + 0.4 * size, y - 0.06 * size, z + 0.1 * size);
}

/** Carré de pelouse, à peine plus haut que la dalle */
export function lawn(kit: Kit, parent: Object3D, w: number, d: number, x: number, z: number) {
  kit.box(parent, "grass", w, 0.07, d, x, 0, z).castShadow = false;
}

/** Petite voiture, l'avant vers +z avant rotation */
export function car(kit: Kit, parent: Object3D, role: Role, x: number, z: number, rotY = 0): Group {
  const group = new Group();
  group.position.set(x, 0, z);
  group.rotation.y = rotY;
  parent.add(group);

  kit.box(group, role, 1.5, 0.5, 3.1, 0, 0.28, 0);
  kit.box(group, "glass", 1.34, 0.44, 1.6, 0, 0.78, -0.15);
  kit.box(group, role, 1.38, 0.08, 1.52, 0, 1.22, -0.15);
  for (const [wx, wz] of [
    [-0.78, 1],
    [0.78, 1],
    [-0.78, -1.05],
    [0.78, -1.05],
  ]) {
    const wheel = kit.cyl(group, "dark", 0.32, 0.32, 0.22, wx, 0, wz, 10);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.y = 0.32;
  }
  kit.box(group, "white", 0.3, 0.14, 0.06, -0.5, 0.48, 1.56);
  kit.box(group, "white", 0.3, 0.14, 0.06, 0.5, 0.48, 1.56);
  return group;
}
