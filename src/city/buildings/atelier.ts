import { Group } from "three";
import { icon, label } from "../signs";
import { FRONT, RIGHT, bush, lawn, screen, tree, type Builder } from "./shared";

/** Ce portfolio : l'atelier, une maisonnette à toit bleu, son drapeau GD et sa boîte aux lettres. */
export const atelier: Builder = (ctx) => {
  const { kit, windows, lotIndex, facing } = ctx;
  const group = new Group();

  // Maisonnette à pignon sur rue
  kit.box(group, "wall", 5.2, 3.2, 4.6, -2.5, 0, -2.4);
  kit.prism(group, "bleu", 5.8, 2.3, 5.2, -2.5, 3.2, -2.4);
  const eye = kit.cyl(group, "glass", 0.45, 0.45, 0.08, -2.5, 4, 0.22, 12);
  eye.rotation.x = Math.PI / 2;
  eye.position.y = 4.15;
  kit.box(group, "wallDark", 0.6, 1.9, 0.6, -1.2, 3.6, -3.6);

  // Porte, fenêtre et son appui
  kit.box(group, "violet", 1, 2.1, 0.1, -3.7, 0, -0.08);
  windows.grid(lotIndex, group, { x: -1.6, y: 1.7, z: -0.1, rotY: FRONT, cols: 1, rows: 1, w: 1.3, h: 1.1, gapX: 0, gapY: 0 });
  kit.box(group, "trim", 1.6, 0.12, 0.26, -1.6, 1, 0);
  windows.grid(lotIndex, group, { x: 0.1, y: 1.7, z: -2.4, rotY: RIGHT, cols: 2, rows: 1, w: 1, h: 1.1, gapX: 0.7, gapY: 0 });

  // Jardin : pelouse, allée, clôture
  lawn(kit, group, 6, 5.2, 3.1, 2.4);
  kit.box(group, "trim", 1, 0.09, 5.2, -3.7, 0, 2.6).castShadow = false;
  for (let i = 0; i < 8; i++) kit.box(group, "white", 0.1, 0.6, 0.1, -2.6 + i * 1.2, 0, 5.3);
  kit.box(group, "white", 8.5, 0.07, 0.06, 1.6, 0.38, 5.3);

  // Panneau au nom du projet, planté dans la pelouse
  kit.cyl(group, "trunk", 0.07, 0.07, 1.5, 1.9, 0, 4.1, 6);
  ctx.signs.plate(lotIndex, group, label(ctx.title), {
    x: 1.9, y: 1.78, z: 4.1, rotY: facing, w: 2.9, h: 0.62, tone: ctx.tone,
  });

  // Mât et drapeau au monogramme
  kit.cyl(group, "metal", 0.05, 0.05, 5.4, 5.3, 0, 1.6, 6);
  ctx.signs.plate(lotIndex, group, icon.monogram, {
    x: 5.3 + Math.cos(facing) * 0.9, y: 4.8, z: 1.6 - Math.sin(facing) * 0.9, rotY: facing, w: 1.7, h: 1.1, tone: ctx.tone,
  });

  // Boîte aux lettres : c'est ici qu'on écrit
  kit.cyl(group, "metal", 0.05, 0.05, 0.9, -2.4, 0, 4.7, 6);
  kit.box(group, "jaune", 0.42, 0.34, 0.66, -2.4, 0.9, 4.7);
  kit.box(group, "rouge", 0.05, 0.3, 0.06, -2.16, 1, 4.5);

  // L'écran traverse le toit
  screen(ctx, group, -2.5, 3.4, -2.8, 2.7);

  tree(kit, group, 4.4, -3.4, 1.25);
  tree(kit, group, 4.2, 2.9, 0.7);
  bush(kit, group, 0.8, 0.9, 0.9);
  bush(kit, group, 3.3, 0.6, 0.75);

  return group;
};
