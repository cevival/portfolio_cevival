import { Group } from "three";
import { icon } from "../signs";
import { FRONT, RIGHT, bush, nameplate, screen, tree, type Builder } from "./shared";

/** LB Digital Site : un studio web entièrement vitré, son écran `</>` et un bout de jardin sur le toit. */
export const studio: Builder = (ctx) => {
  const { kit, windows, lotIndex } = ctx;
  const group = new Group();

  // Dalle, volume vitré et toit
  kit.box(group, "trim", 6.7, 0.3, 5.7, -1.8, 0, -2.1);
  kit.box(group, "glass", 6, 4.2, 5, -1.8, 0.3, -2.1);
  windows.grid(lotIndex, group, {
    x: -1.8, y: 2.3, z: 0.4, rotY: FRONT, cols: 3, rows: 2, w: 1.76, h: 1.74, gapX: 0.16, gapY: 0.16,
  });
  windows.grid(lotIndex, group, {
    x: 1.2, y: 2.3, z: -2.1, rotY: RIGHT, cols: 2, rows: 2, w: 2.2, h: 1.74, gapX: 0.16, gapY: 0.16,
  });
  kit.box(group, "trim", 6.5, 0.3, 5.5, -1.8, 4.5, -2.1);
  kit.box(group, "violet", 6.5, 0.72, 0.14, -1.8, 4.14, 0.68);
  nameplate(ctx, group, 3.4, -1.8, 4.5, 0.75);

  // Sur le toit : un carré de jardin
  kit.box(group, "grass", 2.2, 0.12, 1.8, -3.7, 4.8, -0.5);
  bush(kit, group, -3.9, -0.5, 0.9, 4.92);
  bush(kit, group, -3.1, -0.2, 0.7, 4.92);

  screen(ctx, group, -1.2, 4.8, -3);

  // Totem : un écran de code tourné vers la caméra
  kit.cyl(group, "metal", 0.1, 0.1, 1.3, 4.4, 0, 2.9, 6);
  const totem = new Group();
  totem.position.set(4.4, 1.3, 2.9);
  totem.rotation.y = ctx.facing;
  group.add(totem);
  kit.box(totem, "dark", 3.1, 2, 0.24, 0, 0, 0);
  ctx.signs.plate(lotIndex, totem, icon.code, { x: 0, y: 1, z: 0.13, rotY: 0, w: 2.9, h: 1.8, tone: ctx.tone });

  // Terrasse : une table, un portable, deux tabourets
  kit.cyl(group, "metal", 0.06, 0.06, 0.72, 0.2, 0, 2.6, 6);
  kit.box(group, "trim", 1.5, 0.08, 0.85, 0.2, 0.72, 2.6);
  kit.box(group, "dark", 0.42, 0.03, 0.3, 0.2, 0.8, 2.65);
  kit.box(group, "violet", 0.42, 0.28, 0.03, 0.2, 0.82, 2.48);
  kit.cyl(group, "violet", 0.22, 0.22, 0.45, -0.5, 0, 3.5, 8);
  kit.cyl(group, "violet", 0.22, 0.22, 0.45, 0.9, 0, 3.6, 8);

  tree(kit, group, -5.4, 4, 0.95);

  return group;
};
