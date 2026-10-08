import { Group } from "three";
import { icon, label } from "../signs";
import { FRONT, block, bush, screen, type Builder } from "./shared";

/** LB Digital Marque : l'office des marques, un bâtiment à colonnes et fronton, médaillon ® au centre. */
export const marque: Builder = (ctx) => {
  const { kit, lotIndex } = ctx;
  const group = new Group();

  // Soubassement et marches
  kit.box(group, "trim", 9, 0.5, 7.4, -0.6, 0, -1.2);
  kit.box(group, "trim", 4.4, 0.25, 0.9, -0.6, 0, 2.9);

  // Corps du bâtiment, derrière le portique
  block(ctx, group, "wall", 7.6, 4.2, 4.8, -0.6, 0.5, -2, { cols: 3, rows: 2, base: 0.5, top: 0.5, front: false });
  kit.box(group, "dark", 1.5, 2.9, 0.1, -0.6, 0.5, 0.42);

  // Quatre colonnes et leurs chapiteaux
  for (const x of [-3.8, -1.67, 0.47, 2.6]) {
    kit.cyl(group, "white", 0.3, 0.34, 4.2, x, 0.5, 1.7, 10);
    kit.box(group, "trim", 0.82, 0.2, 0.82, x, 4.5, 1.7);
  }
  // Bannières entre les colonnes
  kit.box(group, "bleu", 0.8, 2.7, 0.06, -2.73, 1.5, 1.4);
  kit.box(group, "bleu", 0.8, 2.7, 0.06, 1.53, 1.5, 1.4);

  // Entablement, fronton et médaillon
  kit.box(group, "wallAlt", 8.4, 0.65, 6.6, -0.6, 4.7, -1.1);
  ctx.signs.plate(lotIndex, group, label(ctx.title), {
    x: -0.6, y: 5.03, z: 2.25, rotY: FRONT, w: 5.6, h: 0.52, tone: ctx.tone,
  });
  kit.prism(group, "trim", 8.4, 1.8, 6.6, -0.6, 5.35, -1.1);
  ctx.signs.plate(lotIndex, group, icon.registered, {
    x: -0.6, y: 6.05, z: 2.25, rotY: FRONT, w: 1.25, h: 1.25, tone: ctx.tone,
  });

  // L'écran traverse le toit
  screen(ctx, group, -0.6, 5.5, -2.4, 2.3);

  // Bacs de part et d'autre des marches
  for (const x of [-3.6, 2.4]) {
    kit.box(group, "wallDark", 0.8, 0.55, 0.8, x, 0, 3.3);
    bush(kit, group, x - 0.05, 3.3, 0.95, 0.55);
  }

  return group;
};
