import { Group } from "three";
import { icon } from "../signs";
import { block, bush, lawn, nameplate, screen, tree, type Builder } from "./shared";

/** QualiTrack : une tour de bureaux et son aile basse, la coche de la qualité en façade. */
export const qualitrack: Builder = (ctx) => {
  const { kit } = ctx;
  const group = new Group();

  // Tour
  block(ctx, group, "wall", 5, 14, 5, -2.9, 0, -1.6, { cols: 4, rows: 7, base: 3.1, top: 3.2 });
  kit.box(group, "trim", 5.4, 0.35, 5.4, -2.9, 14, -1.6);
  kit.box(group, "wallDark", 2.2, 1.1, 2.2, -3.6, 14.35, -2.3);
  kit.cyl(group, "metal", 0.05, 0.05, 2.6, -1.4, 14.35, -0.5, 5);
  kit.blob(group, "rouge", 0.15, -1.4, 16.9, -0.5);

  // Bandeau et coche lumineuse en haut de la tour
  kit.box(group, "violet", 5.06, 0.45, 5.06, -2.9, 10.95, -1.6);
  ctx.signs.plate(ctx.lotIndex, group, icon.check, {
    x: -2.9,
    y: 12.7,
    z: 0.95,
    rotY: 0,
    w: 2.1,
    h: 2.1,
    tone: ctx.tone,
  });

  // Entrée
  kit.box(group, "dark", 1.7, 2.3, 0.12, -2.9, 0, 0.92);
  kit.box(group, "violet", 2.8, 0.22, 1.3, -2.9, 2.5, 1.5);
  kit.cyl(group, "metal", 0.06, 0.06, 2.5, -4.1, 0, 2.05, 6);
  kit.cyl(group, "metal", 0.06, 0.06, 2.5, -1.7, 0, 2.05, 6);

  // Aile basse, qui porte le nom et l'écran
  block(ctx, group, "wallAlt", 6, 4, 5.4, 2.8, 0, -1.4, { cols: 5, rows: 2, base: 0.6, top: 1.25 });
  kit.box(group, "trim", 6.3, 0.28, 5.7, 2.8, 4, -1.4);
  nameplate(ctx, group, 4.2, 2.8, 3.38, 1.3);
  screen(ctx, group, 2.9, 4.28, -1.7);

  // Parvis
  lawn(kit, group, 5.6, 2.2, 3, 4.3);
  tree(kit, group, 4.9, 4.4);
  tree(kit, group, 1.4, 4.5, 0.85, "pine");
  bush(kit, group, 3.1, 4.6);
  tree(kit, group, -5.6, 4.4, 0.8, "pine");

  return group;
};
