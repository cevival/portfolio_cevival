import { Group } from "three";
import { FRONT, block, car, nameplate, screen, tree, type Builder } from "./shared";

/** LB Shop : une boutique à vitrine, store rayé et cartons prêts à partir. */
export const shop: Builder = (ctx) => {
  const { kit, windows, lotIndex } = ctx;
  const group = new Group();

  block(ctx, group, "wall", 6.6, 3.8, 5, -2, 0, -2.3, { cols: 2, rows: 1, base: 1.3, top: 1, front: false });
  kit.box(group, "trim", 6.9, 0.95, 5.3, -2, 3.8, -2.3);
  nameplate(ctx, group, 3.5, -2, 4.27, 0.35);

  // Vitrine et porte
  windows.grid(lotIndex, group, {
    x: -3.1, y: 1.3, z: 0.2, rotY: FRONT, cols: 2, rows: 1, w: 1.7, h: 1.9, gapX: 0.18, gapY: 0,
  });
  kit.box(group, "dark", 1.15, 2.2, 0.1, 0.3, 0, 0.22);

  // Store rayé, incliné vers la rue
  for (let i = 0; i < 7; i++) {
    kit.box(group, i % 2 ? "white" : "jaune", 0.9, 0.08, 1.7, -4.7 + i * 0.9, 2.7, 0.95).rotation.x = 0.42;
  }
  kit.box(group, "jaune", 6.3, 0.26, 0.06, -2, 2.26, 1.74);

  // Cartons, fermés d'un ruban
  kit.box(group, "trim", 1.1, 0.9, 1.1, 3, 0, 2.6);
  kit.box(group, "jaune", 0.2, 0.02, 1.1, 3, 0.9, 2.6);
  kit.box(group, "trim", 0.9, 0.75, 0.9, 4.2, 0, 3);
  kit.box(group, "jaune", 0.9, 0.02, 0.18, 4.2, 0.75, 3);
  const top = kit.box(group, "trim", 0.85, 0.7, 0.85, 3.1, 0.92, 2.65);
  top.rotation.y = 0.35;
  kit.box(group, "trim", 0.7, 0.6, 0.7, 2.2, 0, 3.9);

  // Voiture de livraison
  car(kit, group, "jaune", 4.6, -1.8);

  screen(ctx, group, -2, 4.75, -2.6);

  tree(kit, group, -5.5, 4.4, 0.9);
  tree(kit, group, 5.4, 4.6, 0.75, "pine");

  return group;
};
