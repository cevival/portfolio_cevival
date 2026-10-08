import { Group } from "three";
import { billboard } from "../signs";
import type { Builder } from "./shared";

/** Texte du panneau : la première ligne en petit, la seconde en grand */
export function lotBillboard(text: string) {
  const [small, big = ""] = text.split("\n");
  return big ? billboard(small, big) : billboard("", small);
}

/** Le terrain à bâtir : une grue, un échafaudage, et un panneau qui attend le prochain projet. */
export const lot: Builder = (ctx) => {
  const { kit, lotIndex, facing } = ctx;
  const group = new Group();

  kit.box(group, "trunk", 11.6, 0.05, 10.6, 0, 0, 0).castShadow = false;

  // Fondations et murs commencés
  kit.box(group, "trim", 5.4, 0.4, 4.4, -2.5, 0, -2.1);
  kit.box(group, "wallAlt", 0.4, 1.7, 4.4, -5, 0.4, -2.1);
  kit.box(group, "wallAlt", 5.4, 1.1, 0.4, -2.5, 0.4, -4.1);
  kit.box(group, "wallAlt", 0.4, 0.7, 2, 0, 0.4, -3.3);
  for (const [x, z] of [
    [-0.1, -0.2],
    [-1.6, -0.2],
    [-3.1, -0.2],
    [0, -1.6],
    [-4.9, 0.3],
  ]) {
    kit.cyl(group, "metal", 0.04, 0.04, 1.3, x, 0.4, z, 5);
  }

  // Échafaudage le long du mur
  for (const x of [-4.5, -3.6]) {
    for (const z of [-3.8, -2.1, -0.4]) kit.cyl(group, "metal", 0.05, 0.05, 3.3, x, 0.4, z, 5);
  }
  kit.box(group, "trunk", 1.1, 0.08, 3.8, -4.05, 1.9, -2.1);
  kit.box(group, "trunk", 1.1, 0.08, 3.8, -4.05, 3.3, -2.1);

  // Grue : fût, cabine, flèche, contrepoids, et le premier bloc du prochain bâtiment
  kit.box(group, "wallDark", 1.7, 0.5, 1.7, -4.6, 0, 3.2);
  kit.cyl(group, "jaune", 0.42, 0.42, 8.2, -4.6, 0.5, 3.2, 4).rotation.y = Math.PI / 4;
  kit.box(group, "white", 0.95, 0.95, 0.95, -3.95, 8.3, 3.2);
  const jib = new Group();
  // Pas plus haute : au-delà, sa flèche entre dans le cadre de l'arrêt voisin
  jib.position.set(-4.6, 8.9, 3.2);
  // La flèche pointe vers les fondations
  jib.rotation.y = 1.2;
  group.add(jib);
  kit.box(jib, "jaune", 8.6, 0.32, 0.32, 3.9, 0, 0);
  kit.box(jib, "jaune", 2.8, 0.28, 0.28, -1.5, 0, 0);
  kit.box(jib, "wallDark", 1, 0.8, 0.8, -2.5, -0.6, 0);
  kit.cyl(jib, "jaune", 0.05, 0.3, 1.5, 0, 0.3, 0, 4);
  kit.cyl(jib, "dark", 0.03, 0.03, 2.9, 5.4, -2.9, 0, 5);
  kit.box(jib, "violet", 1.4, 1.4, 1.4, 5.4, -4.3, 0);

  // Panneau tourné vers la caméra
  const board = new Group();
  board.position.set(1.6, 0, 3.6);
  board.rotation.y = facing;
  group.add(board);
  kit.cyl(board, "metal", 0.1, 0.1, 1.8, -2.2, 0, -0.1, 6);
  kit.cyl(board, "metal", 0.1, 0.1, 1.8, 2.2, 0, -0.1, 6);
  kit.box(board, "dark", 6.3, 2.9, 0.2, 0, 1.6, -0.1);
  const sign = ctx.signs.plate(lotIndex, board, lotBillboard(ctx.lotLabel), {
    x: 0, y: 3.05, z: 0.02, rotY: 0, w: 6.1, h: 2.7, tone: ctx.tone,
  });
  group.userData.sign = sign;
  // Point d'accroche de l'étiquette HTML, au-dessus du panneau
  group.userData.anchor = board.position.clone().setY(5);

  // Barrières de chantier, basses pour laisser voir
  for (let i = 0; i < 6; i++) kit.box(group, "jaune", 0.1, 0.9, 0.1, 5.5, 0, -5 + i * 1.1);
  kit.box(group, "jaune", 0.06, 0.14, 5.7, 5.5, 0.62, -2.25);
  kit.box(group, "white", 0.06, 0.14, 5.7, 5.5, 0.32, -2.25);

  // Tas de sable, palette de briques, plots
  kit.cone(group, "trim", 1.2, 0.75, 4.4, 0, 1.4, 7);
  kit.box(group, "trunk", 1.3, 0.12, 1, 4.6, 0, 4.3);
  kit.box(group, "rouge", 1.2, 0.6, 0.9, 4.6, 0.12, 4.3);
  for (const [x, z] of [
    [2.2, 5.1],
    [3.4, 5.3],
  ]) {
    kit.cone(group, "rouge", 0.2, 0.5, x, 0, z, 8);
  }

  return group;
};
