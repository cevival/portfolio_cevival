import { Group } from "three";
import { block, nameplate, screen, tree, type Builder } from "./shared";

/** Thill-Loehr : une station de télégestion, son mât d'antennes, sa parabole et ses armoires. */
export const station: Builder = (ctx) => {
  const { kit, windows, lotIndex } = ctx;
  const group = new Group();

  // Bâtiment technique, peu de fenêtres
  block(ctx, group, "wallDark", 6.4, 3.4, 4.8, -2.4, 0, -2.2, { cols: 3, rows: 1, base: 0.9, top: 1.5 });
  kit.box(group, "trim", 6.7, 0.25, 5.1, -2.4, 3.4, -2.2);
  nameplate(ctx, group, 3.6, -2.4, 2.75, 0.2);
  kit.box(group, "dark", 1, 2, 0.1, 0, 0, 0.22);

  // Sur le toit : groupes de ventilation et parabole tournée vers la caméra
  kit.box(group, "metal", 1.5, 0.8, 1.2, -4.6, 3.65, -0.6);
  kit.cyl(group, "metal", 0.3, 0.3, 0.5, -4.6, 4.45, -0.6, 8);
  kit.cyl(group, "metal", 0.1, 0.1, 1, 0.2, 3.65, -0.5, 6);
  const dish = kit.cyl(group, "white", 1.15, 0.16, 0.5, 0.2, 4.6, -0.5, 12);
  dish.rotation.order = "YXZ";
  dish.rotation.set(1.05, ctx.facing, 0);

  // Mât : fût effilé, plateformes, panneaux d'antenne, balise rouge
  kit.cyl(group, "metal", 0.16, 0.5, 10, 4.3, 0, -3, 4).rotation.y = Math.PI / 4;
  kit.box(group, "trim", 1.2, 0.08, 1.2, 4.3, 5, -3);
  kit.box(group, "trim", 1, 0.08, 1, 4.3, 8, -3);
  kit.box(group, "white", 0.14, 1.2, 0.3, 4.75, 8.2, -3);
  kit.box(group, "white", 0.3, 1.2, 0.14, 4.3, 8.2, -2.55);
  kit.box(group, "white", 0.14, 1.2, 0.3, 3.85, 8.2, -3);
  kit.cyl(group, "metal", 0.04, 0.04, 1.6, 4.3, 10, -3, 5);
  kit.blob(group, "rouge", 0.17, 4.3, 11.5, -3);

  // Armoires électriques : leurs voyants s'allument avec le bâtiment
  for (let i = 0; i < 3; i++) {
    const x = 2.4 + i * 1.15;
    kit.box(group, "metal", 0.95, 1.5, 0.6, x, 0, 2.9);
    kit.box(group, "violet", 0.66, 0.08, 0.04, x, 1.22, 3.21);
    windows.grid(lotIndex, group, {
      x, y: 0.82, z: 3.2, rotY: 0, cols: 3, rows: 2, w: 0.1, h: 0.1, gapX: 0.1, gapY: 0.12,
    });
  }
  kit.box(group, "dark", 0.2, 0.1, 2.7, 2, 0, 1.5);

  screen(ctx, group, -2.6, 3.65, -3);

  tree(kit, group, -5.4, 4.2, 0.9, "pine");
  tree(kit, group, -3.8, 4.5, 0.75, "pine");

  return group;
};
