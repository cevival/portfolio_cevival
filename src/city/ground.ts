// Le socle de la ville (une maquette posée sur la page), ses rues, et le sol
// lointain : une grille qui se fond dans la couleur du papier.
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  Object3D,
  PlaneGeometry,
  ShadowMaterial,
} from "three";
import type { Kit } from "./kit";
import { CITY, LOTS } from "./layout";
import type { Palette } from "./palette";

export interface Ground {
  group: Group;
  /** Recolore ce qui ne passe pas par les matériaux du kit */
  setPalette(from: Palette, to: Palette, mix: number): void;
  dispose(): void;
}

const ROAD_HEIGHT = 0.05;
const GRID_STEP = 8;
const GRID_REACH = 480;

export function createGround(kit: Kit, palette: Palette): Ground {
  const group = new Group();
  const { cols, rows, lotW, lotD, road, width, depth, thickness, plate } = CITY;
  const pitchX = lotW + road;
  const pitchZ = lotD + road;

  // ─── Socle : dessus clair, tranche plus sombre
  const slabGeometry = new BoxGeometry(width, thickness, depth);
  const side = kit.material("slabSide");
  const slab = new Mesh(slabGeometry, [side, side, kit.material("slab"), side, side, side]);
  slab.position.y = -thickness / 2;
  slab.castShadow = true;
  slab.receiveShadow = true;
  group.add(slab);

  // ─── Rues. Les rues transversales font toute la largeur ; les autres sont
  // découpées entre elles, pour que deux dessus ne se superposent jamais.
  const roadXs = Array.from({ length: cols + 1 }, (_, c) => (c - cols / 2) * pitchX);
  const roadZs = Array.from({ length: rows + 1 }, (_, r) => (r - rows / 2) * pitchZ);
  const lotZs = Array.from({ length: rows }, (_, r) => (r - (rows - 1) / 2) * pitchZ);
  const lotXs = Array.from({ length: cols }, (_, c) => (c - (cols - 1) / 2) * pitchX);

  for (const z of roadZs) {
    kit.box(group, "road", cols * pitchX + road, ROAD_HEIGHT, road, 0, 0, z).castShadow = false;
  }
  for (const x of roadXs) {
    for (const z of lotZs) {
      kit.box(group, "road", road, ROAD_HEIGHT, lotD, x, 0, z).castShadow = false;
    }
  }

  // ─── Pointillés au milieu des rues, hors carrefours
  const dashes: { x: number; z: number; turned: boolean }[] = [];
  for (const z of roadZs) {
    for (const x of lotXs) {
      for (let k = 0; k < 4; k++) dashes.push({ x: x + (k - 1.5) * 3, z, turned: false });
    }
  }
  for (const x of roadXs) {
    for (const z of lotZs) {
      for (let k = 0; k < 4; k++) dashes.push({ x, z: z + (k - 1.5) * 2.8, turned: true });
    }
  }
  const dashGeometry = new BoxGeometry(1.1, 0.02, 0.16);
  const dashMesh = new InstancedMesh(dashGeometry, kit.material("roadMark"), dashes.length);
  const dummy = new Object3D();
  dashes.forEach((dash, i) => {
    dummy.position.set(dash.x, ROAD_HEIGHT + 0.01, dash.z);
    dummy.rotation.y = dash.turned ? Math.PI / 2 : 0;
    dummy.updateMatrix();
    dashMesh.setMatrixAt(i, dummy.matrix);
  });
  dashMesh.receiveShadow = true;
  group.add(dashMesh);

  // ─── Une dalle par parcelle : les bâtiments sont posés dessus
  for (const lot of LOTS) {
    kit.box(group, "pavement", lotW - 0.5, plate, lotD - 0.5, lot.x, 0, lot.z);
  }

  // ─── Sol lointain : il ne montre que l'ombre du socle, le reste est le fond de page
  const shadowMaterial = new ShadowMaterial({ opacity: palette.shadow });
  const shadowCatcher = new Mesh(new PlaneGeometry(600, 600), shadowMaterial);
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = -thickness;
  shadowCatcher.receiveShadow = true;
  group.add(shadowCatcher);

  // ─── Grille : le brouillard, de la couleur du papier, l'efface au loin
  const points: number[] = [];
  for (let v = -GRID_REACH; v <= GRID_REACH; v += GRID_STEP) {
    points.push(v, 0, -GRID_REACH, v, 0, GRID_REACH, -GRID_REACH, 0, v, GRID_REACH, 0, v);
  }
  const gridGeometry = new BufferGeometry();
  gridGeometry.setAttribute("position", new Float32BufferAttribute(points, 3));
  const gridMaterial = new LineBasicMaterial({ color: palette.rule });
  const grid = new LineSegments(gridGeometry, gridMaterial);
  grid.position.y = -thickness + 0.02;
  group.add(grid);

  const a = new Color();
  const b = new Color();

  return {
    group,
    setPalette(from, to, mix) {
      shadowMaterial.opacity = from.shadow + (to.shadow - from.shadow) * mix;
      gridMaterial.color.lerpColors(a.setHex(from.rule), b.setHex(to.rule), mix);
    },
    dispose() {
      slabGeometry.dispose();
      dashGeometry.dispose();
      shadowCatcher.geometry.dispose();
      shadowMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
    },
  };
}
