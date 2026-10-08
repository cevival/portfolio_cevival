import { Group } from "three";
import { icon } from "../signs";
import { FRONT, block, bush, lawn, nameplate, screen, tree, type Builder } from "./shared";

/** Dr Salti : un cabinet moderne en deux volumes décalés, grande baie vitrée, enseigne à la dent. */
export const drSalti: Builder = (ctx) => {
  const { kit, windows, lotIndex } = ctx;
  const group = new Group();

  // Volume principal : une baie vitrée sur toute la façade
  block(ctx, group, "wall", 6.2, 4.4, 5.4, -2.1, 0, -1.7, { cols: 2, rows: 1, base: 1.5, top: 1.3, front: false });
  windows.grid(lotIndex, group, {
    x: -2.1, y: 1.65, z: 1, rotY: FRONT, cols: 3, rows: 1, w: 1.5, h: 2.3, gapX: 0.16, gapY: 0,
  });
  kit.box(group, "trim", 5.3, 0.14, 0.2, -2.1, 0.36, 1.06);
  kit.box(group, "trim", 6.5, 0.3, 5.7, -2.1, 4.4, -1.7);
  kit.box(group, "rouge", 6.54, 0.14, 5.74, -2.1, 4.14, -1.7);
  nameplate(ctx, group, 3.5, -2.1, 3.5, 1);

  // Second volume, en avant : l'entrée
  block(ctx, group, "wallAlt", 4.2, 3, 4.2, 3.2, 0, 1.2, { cols: 2, rows: 1, base: 1.1, top: 0.8, front: false });
  kit.box(group, "trim", 4.45, 0.24, 4.45, 3.2, 3, 1.2);
  kit.box(group, "dark", 1.3, 2.15, 0.12, 2.4, 0, 3.3);
  kit.box(group, "rouge", 2.3, 0.18, 1.2, 2.4, 2.35, 3.8);
  windows.grid(lotIndex, group, {
    x: 4.3, y: 1.55, z: 3.3, rotY: FRONT, cols: 1, rows: 1, w: 1.1, h: 1.3, gapX: 0, gapY: 0,
  });

  // Enseigne à la dent, sur un mât tourné vers la caméra
  kit.cyl(group, "metal", 0.07, 0.07, 3.3, -5.3, 0, 4.4, 6);
  ctx.signs.plate(lotIndex, group, icon.tooth, {
    x: -5.3, y: 4.15, z: 4.4, rotY: ctx.facing, w: 1.9, h: 1.9, tone: ctx.tone,
  });

  screen(ctx, group, -2.1, 4.7, -2);

  // Jardin
  lawn(kit, group, 6.4, 2.6, -2.6, 3.9);
  tree(kit, group, -1.2, 4.3, 0.9);
  bush(kit, group, -3.3, 3.6);
  bush(kit, group, 0.6, 3.5, 0.8);
  tree(kit, group, 5.6, -3.9, 0.9, "pine");

  return group;
};
