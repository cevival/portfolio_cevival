import { Group } from "three";
import { label } from "../signs";
import { FRONT, block, screen, tree, type Builder } from "./shared";

/** Un Jour de Rien : un théâtre à façade en gradins, marquise à ampoules et rideau rouge. */
export const theatre: Builder = (ctx) => {
  const { kit, windows, lotIndex } = ctx;
  const group = new Group();

  // Corps central et ailes plus basses
  block(ctx, group, "wall", 4.4, 6.4, 5.6, -0.9, 0, -2, { cols: 3, rows: 1, base: 3.9, top: 0.7, right: false });
  block(ctx, group, "wallAlt", 2.3, 4.8, 5.2, -4.25, 0, -2, { cols: 1, rows: 1, base: 3.1, top: 0.6, right: false });
  block(ctx, group, "wallAlt", 2.3, 4.8, 5.2, 2.45, 0, -2, { cols: 1, rows: 2, base: 1, top: 0.6 });
  kit.box(group, "trim", 3.4, 0.5, 4.6, -0.9, 6.4, -2);
  kit.box(group, "trim", 2.2, 0.5, 3.4, -0.9, 6.9, -2);

  // Rideau rouge derrière les portes
  kit.box(group, "rouge", 3, 2.3, 0.08, -0.9, 0, 0.82);
  kit.box(group, "dark", 0.9, 2.2, 0.06, -1.7, 0, 0.88);
  kit.box(group, "dark", 0.9, 2.2, 0.06, -0.1, 0, 0.88);

  // Marquise : le nom en façade, des ampoules en dessous
  kit.box(group, "rouge", 5.8, 0.85, 1.9, -0.9, 2.45, 1.75);
  ctx.signs.plate(lotIndex, group, label(ctx.title), {
    x: -0.9, y: 2.88, z: 2.75, rotY: FRONT, w: 5.3, h: 0.72, tone: ctx.tone,
  });
  windows.grid(lotIndex, group, {
    x: -0.9, y: 2.36, z: 2.7, rotY: FRONT, cols: 12, rows: 1, w: 0.15, h: 0.15, gapX: 0.31, gapY: 0,
  });

  // Affiches encadrées sur les ailes
  for (const x of [-4.25, 2.45]) {
    kit.box(group, "jaune", 1.4, 1.9, 0.06, x, 0.7, 0.62);
    kit.box(group, "dark", 1.16, 1.66, 0.08, x, 0.82, 0.63);
  }
  kit.box(group, "trim", 6.4, 0.16, 1.4, -0.9, 0, 1.6);

  screen(ctx, group, -0.9, 7.4, -2.2, 0.6);

  tree(kit, group, 5.3, 3.6, 0.95);
  tree(kit, group, -5.5, 4.2, 0.85);

  return group;
};
