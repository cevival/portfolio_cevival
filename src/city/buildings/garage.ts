import { Group } from "three";
import { FRONT, block, car, nameplate, screen, tree, type Builder } from "./shared";

/** Point S Rambrouch : un garage à deux portes sectionnelles, pneus empilés, voiture sur le pont. */
export const garage: Builder = (ctx) => {
  const { kit, windows, lotIndex } = ctx;
  const group = new Group();

  // Hall à toit à deux pans : le pignon fait face à la rue
  block(ctx, group, "wallAlt", 9, 4.4, 6, -1.1, 0, -2.1, { cols: 3, rows: 1, base: 2.4, top: 0.9, front: false });
  kit.prism(group, "roof", 9.5, 1.4, 6.5, -1.1, 4.4, -2.1);
  kit.box(group, "jaune", 9.04, 0.5, 0.14, -1.1, 3.55, 0.92);
  nameplate(ctx, group, 3.3, -1.1, 4.86, 1.15, FRONT, "Point S");

  // Porte fermée, à lames
  kit.box(group, "metal", 3, 3, 0.1, -3.7, 0, 0.92);
  for (let i = 1; i < 5; i++) kit.box(group, "trim", 3, 0.05, 0.05, -3.7, i * 0.6, 0.98);

  // Porte ouverte : une voiture en sort
  kit.box(group, "dark", 3, 3, 0.1, -0.1, 0, 0.9);
  car(kit, group, "rouge", -0.1, 1.5);

  // Bureau : porte et fenêtre
  kit.box(group, "dark", 0.9, 2, 0.1, 2.4, 0, 0.92);
  windows.grid(lotIndex, group, {
    x: 2.4, y: 2.75, z: 0.9, rotY: FRONT, cols: 1, rows: 1, w: 0.9, h: 0.6, gapX: 0, gapY: 0,
  });

  // Piles de pneus
  for (let i = 0; i < 4; i++) kit.cyl(group, "dark", 0.42, 0.42, 0.26, -5.5, i * 0.27, 3.5, 10);
  for (let i = 0; i < 2; i++) kit.cyl(group, "dark", 0.42, 0.42, 0.26, -4.5, i * 0.27, 4.3, 10);
  kit.cyl(group, "bleu", 0.3, 0.3, 0.8, -5.6, 0, 1.6, 8);
  kit.cyl(group, "rouge", 0.3, 0.3, 0.8, -4.9, 0, 1.4, 8);

  // Pont élévateur et voiture levée
  kit.cyl(group, "metal", 0.11, 0.11, 2.4, 3.5, 0, 3.4, 6);
  kit.cyl(group, "metal", 0.11, 0.11, 2.4, 5.7, 0, 3.4, 6);
  kit.box(group, "metal", 2.4, 0.1, 0.34, 4.6, 1.02, 2.6);
  kit.box(group, "metal", 2.4, 0.1, 0.34, 4.6, 1.02, 4.2);
  car(kit, group, "bleu", 4.6, 3.4).position.y = 1.1;

  // L'écran traverse le toit
  screen(ctx, group, -1.1, 4.6, -2.6, 1.9);

  tree(kit, group, 5.3, -4, 0.9, "pine");

  return group;
};
