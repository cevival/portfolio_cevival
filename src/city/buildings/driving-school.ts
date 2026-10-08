import { Group } from "three";
import { FRONT, RIGHT, car, nameplate, screen, tree, type Builder } from "./shared";

/** SC Conduite : une auto-école, sa voiture à panneau de toit et un slalom de plots. */
export const drivingSchool: Builder = (ctx) => {
  const { kit, windows, lotIndex } = ctx;
  const group = new Group();

  // Petit bâtiment à toit à quatre pans
  kit.box(group, "wall", 5.6, 3.2, 4.4, -3, 0, -2.8);
  kit.pyramid(group, "rouge", 6.2, 1.5, 5, -3, 3.2, -2.8);
  nameplate(ctx, group, 3.2, -3, 2.72, -0.6);

  // Façade : une fenêtre, la porte sous son auvent, une fenêtre
  for (const x of [-4.75, -1.25]) {
    windows.grid(lotIndex, group, { x, y: 1.5, z: -0.6, rotY: FRONT, cols: 1, rows: 1, w: 1.1, h: 1.1, gapX: 0, gapY: 0 });
  }
  kit.box(group, "dark", 1, 2.1, 0.1, -3, 0, -0.58);
  kit.box(group, "rouge", 1.7, 0.14, 0.9, -3, 2.2, -0.2);
  windows.grid(lotIndex, group, { x: -0.2, y: 1.5, z: -2.8, rotY: RIGHT, cols: 2, rows: 1, w: 1.1, h: 1.1, gapX: 0.7, gapY: 0 });

  // Voiture-école et son panneau de toit
  const learner = car(kit, group, "white", 3.2, 1.6, -0.6);
  kit.box(learner, "jaune", 0.95, 0.24, 0.34, 0, 1.3, -0.15);
  kit.box(learner, "rouge", 1.54, 0.12, 3.14, 0, 0.42, 0);

  // Places tracées au sol
  for (const x of [1.3, 5.2]) kit.box(group, "white", 0.1, 0.02, 3.4, x, 0, 1.4).castShadow = false;

  // Slalom de plots
  for (let i = 0; i < 5; i++) {
    const x = -4.8 + i * 1.45;
    const z = 4.2 + (i % 2 ? 0.45 : -0.25);
    kit.box(group, "rouge", 0.5, 0.05, 0.5, x, 0, z);
    kit.cone(group, "rouge", 0.2, 0.52, x, 0.05, z, 8);
    kit.cyl(group, "white", 0.1, 0.14, 0.12, x, 0.22, z, 8);
  }

  // Panneau stop, face à la caméra
  kit.cyl(group, "metal", 0.05, 0.05, 2.1, 5.6, 0, 4.7, 6);
  const stop = kit.cyl(group, "rouge", 0.45, 0.45, 0.07, 5.6, 2.1, 4.7, 8);
  stop.rotation.order = "YXZ";
  stop.rotation.set(Math.PI / 2, ctx.facing, 0);
  stop.position.y = 2.45;

  // L'écran traverse le toit
  screen(ctx, group, -3, 3.4, -3, 2);

  tree(kit, group, 5.4, -4, 0.95);

  return group;
};
