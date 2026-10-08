import { Group } from "three";
import { icon } from "../signs";
import { block, bush, lawn, nameplate, screen, tree, type Builder } from "./shared";

/** Dr Sasportas : un cabinet en L à toits bleus, une pergola dans l'angle, enseigne à la croix. */
export const sasportas: Builder = (ctx) => {
  const { kit, lotIndex } = ctx;
  const group = new Group();

  // Aile du fond, longue
  block(ctx, group, "wall", 8.6, 3.6, 4, -0.4, 0, -3.2, { cols: 5, rows: 1, base: 1.2, top: 1 });
  kit.box(group, "bleu", 9, 0.3, 4.4, -0.4, 3.6, -3.2);

  // Aile de devant
  block(ctx, group, "wallAlt", 4.2, 3.6, 4.4, -2.6, 0, 1, { cols: 1, rows: 1, base: 1.1, top: 1, front: false });
  kit.box(group, "bleu", 4.6, 0.3, 4.8, -2.6, 3.6, 1);
  ctx.signs.plate(lotIndex, group, icon.cross, {
    x: -2.6, y: 2.1, z: 3.25, rotY: 0, w: 1.9, h: 1.9, tone: ctx.tone,
  });
  kit.box(group, "dark", 0.12, 2.1, 1.2, -0.46, 0, 1.6);

  // Pergola dans l'angle du L
  const posts = [
    [0.5, -0.9],
    [4, -0.9],
    [0.5, 2.9],
    [4, 2.9],
  ];
  for (const [x, z] of posts) kit.cyl(group, "trim", 0.09, 0.09, 2.6, x, 0, z, 6);
  kit.box(group, "trim", 3.8, 0.14, 0.16, 2.25, 2.6, -0.9);
  kit.box(group, "trim", 3.8, 0.14, 0.16, 2.25, 2.6, 2.9);
  for (let i = 0; i < 6; i++) kit.box(group, "bleu", 0.18, 0.08, 4.1, 0.6 + i * 0.66, 2.74, 1);
  nameplate(ctx, group, 3.4, 2.25, 2.05, 2.98);

  // Sous la pergola : un banc et deux bacs
  kit.box(group, "trim", 1.8, 0.42, 0.5, 2.2, 0, -0.3);
  kit.box(group, "wallDark", 0.7, 0.5, 0.7, 4.1, 0, 0.9);
  bush(kit, group, 4.05, 0.9, 0.85, 0.5);
  kit.box(group, "wallDark", 0.7, 0.5, 0.7, 4.1, 0, 2.1);
  bush(kit, group, 4.05, 2.1, 0.85, 0.5);

  screen(ctx, group, -0.2, 3.9, -3.4);

  lawn(kit, group, 3.2, 2.2, 4.3, 4.3);
  tree(kit, group, 5, 4.4, 0.95);
  tree(kit, group, -5.4, 4.6, 0.8, "pine");

  return group;
};
