// Toutes les fenêtres de la ville dans un seul maillage instancié, sans
// éclairage : la nuit elles s'allument, et celles de l'arrêt actif s'allument toutes.
import {
  Color,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  type Scene,
} from "three";
import type { Palette } from "./palette";

export interface WindowGrid {
  /** Centre de la grille, sur le mur */
  x: number;
  y: number;
  z: number;
  /** Orientation du mur : 0 = face avant (+z), π/2 = face droite (+x) */
  rotY: number;
  cols: number;
  rows: number;
  /** Taille d'une fenêtre et espace entre deux fenêtres */
  w: number;
  h: number;
  gapX: number;
  gapY: number;
}

export interface Windows {
  grid(lotIndex: number, parent: Object3D, at: WindowGrid): void;
  /** Crée le maillage une fois tous les bâtiments posés dans la scène */
  build(scene: Scene): void;
  setPalette(from: Palette, to: Palette, mix: number): void;
  /** Une valeur 0 → 1 par parcelle */
  setActive(amounts: readonly number[]): void;
  tick(time: number): void;
  dispose(): void;
}

interface Pane {
  lot: number;
  parent: Object3D;
  local: Matrix4;
  /** Tirage stable : décide si la fenêtre est allumée, et de quelle teinte */
  luck: number;
  tint: number;
}

// Légèrement décollées du mur, pour ne pas scintiller avec lui
const OFFSET = 0.03;
const TWINKLE_EVERY = 0.45;

export function createWindows(palette: Palette): Windows {
  const panes: Pane[] = [];
  const geometry = new PlaneGeometry(1, 1);
  const material = new MeshBasicMaterial({ toneMapped: false });
  let mesh: InstancedMesh | null = null;

  let from = palette;
  let to = palette;
  let mix = 1;
  let active: readonly number[] = [];
  let lastTwinkle = 0;
  let dirty = true;

  const dummy = new Object3D();
  const a = new Color();
  const b = new Color();
  const color = new Color();

  const pick = (list: readonly number[], tint: number) => list[Math.floor(tint * list.length) % list.length];

  function paneColor(pane: Pane, p: Palette, target: Color) {
    const boost = active[pane.lot] ?? 0;
    const share = p.litShare + (1 - p.litShare) * boost;
    return target.setHex(pane.luck < share ? pick(p.windowLit, pane.tint) : pick(p.windowOff, pane.tint));
  }

  function repaint() {
    if (!mesh) return;
    panes.forEach((pane, i) => {
      paneColor(pane, from, a);
      paneColor(pane, to, b);
      mesh!.setColorAt(i, color.lerpColors(a, b, mix));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    dirty = false;
  }

  return {
    grid(lotIndex, parent, at) {
      const pitchX = at.w + at.gapX;
      const pitchY = at.h + at.gapY;
      for (let row = 0; row < at.rows; row++) {
        for (let col = 0; col < at.cols; col++) {
          // Position dans le plan du mur, puis rotation et décollement
          dummy.position.set((col - (at.cols - 1) / 2) * pitchX, (row - (at.rows - 1) / 2) * pitchY, OFFSET);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(at.w, at.h, 1);
          dummy.updateMatrix();
          const wall = new Matrix4().makeRotationY(at.rotY).setPosition(at.x, at.y, at.z);
          panes.push({
            lot: lotIndex,
            parent,
            local: wall.multiply(dummy.matrix),
            luck: Math.random(),
            tint: Math.random(),
          });
        }
      }
    },

    build(scene) {
      scene.updateMatrixWorld(true);
      mesh = new InstancedMesh(geometry, material, panes.length);
      const world = new Matrix4();
      panes.forEach((pane, i) => {
        world.multiplyMatrices(pane.parent.matrixWorld, pane.local);
        mesh!.setMatrixAt(i, world);
      });
      mesh.instanceMatrix.needsUpdate = true;
      // Les instances couvrent toute la ville : pas de test de visibilité global
      mesh.frustumCulled = false;
      scene.add(mesh);
      repaint();
    },

    setPalette(nextFrom, nextTo, nextMix) {
      from = nextFrom;
      to = nextTo;
      mix = nextMix;
      dirty = true;
    },

    setActive(amounts) {
      active = amounts;
      dirty = true;
    },

    tick(time) {
      // Quelques fenêtres changent d'état : la ville vit
      if (time - lastTwinkle > TWINKLE_EVERY && panes.length > 0) {
        lastTwinkle = time;
        for (let k = 0; k < 3; k++) panes[Math.floor(Math.random() * panes.length)].luck = Math.random();
        dirty = true;
      }
      if (dirty) repaint();
    },

    dispose() {
      geometry.dispose();
      material.dispose();
      mesh?.dispose();
    },
  };
}
