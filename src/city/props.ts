// Ce qui fait vivre la ville : lampadaires et leurs halos, voitures qui
// suivent les rues, et la balise qui flotte au-dessus de l'arrêt actif.
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OctahedronGeometry,
  PlaneGeometry,
  type Vector3,
} from "three";
import { car } from "./buildings/shared";
import type { Kit } from "./kit";
import { CITY, LOTS } from "./layout";
import type { Palette, Role, Tone } from "./palette";

export interface Props {
  group: Group;
  setPalette(from: Palette, to: Palette, mix: number): void;
  /** Pose la balise au-dessus d'un point ; `amount` (0 → 1) règle sa taille */
  setBeacon(at: Vector3 | null, tone: Tone, amount: number): void;
  tick(time: number, dt: number): void;
  dispose(): void;
}

const LAMP_HEIGHT = 2.7;
const BULB_DAY = 0xdad5f2;
const BULB_NIGHT = 0xffdf8f;
const CAR_SPEED = 4.2;
// Écart à l'axe de la rue : chacun roule sur sa voie
const LANE = 0.72;

/** Disque lumineux dégradé, pour le halo d'un lampadaire sur le sol */
function haloTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255, 214, 130, 0.55)");
    gradient.addColorStop(0.45, "rgba(190, 150, 255, 0.16)");
    gradient.addColorStop(1, "rgba(120, 100, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(canvas);
}

interface Route {
  points: [number, number][];
  length: number;
}

function route(points: [number, number][]): Route {
  let length = 0;
  points.forEach(([x, z], i) => {
    const [nx, nz] = points[(i + 1) % points.length];
    length += Math.hypot(nx - x, nz - z);
  });
  return { points, length };
}

/** Position et cap à la distance `along` sur une boucle fermée */
function along(path: Route, distance: number) {
  let left = ((distance % path.length) + path.length) % path.length;
  for (let i = 0; i < path.points.length; i++) {
    const [x, z] = path.points[i];
    const [nx, nz] = path.points[(i + 1) % path.points.length];
    const segment = Math.hypot(nx - x, nz - z);
    if (left <= segment) {
      const t = left / segment;
      const dx = (nx - x) / segment;
      const dz = (nz - z) / segment;
      return {
        // Décalé sur la voie de droite
        x: x + (nx - x) * t - dz * LANE,
        z: z + (nz - z) * t + dx * LANE,
        heading: Math.atan2(dx, dz),
      };
    }
    left -= segment;
  }
  return { x: path.points[0][0], z: path.points[0][1], heading: 0 };
}

export function createProps(kit: Kit, palette: Palette): Props {
  const group = new Group();
  const { lotW, lotD, road, cols, rows, plate } = CITY;
  const dummy = new Object3D();

  // ─── Lampadaires : deux par parcelle, aux coins opposés
  const spots: [number, number][] = [];
  for (const lot of LOTS) {
    spots.push([lot.x - lotW / 2 + 0.45, lot.z + lotD / 2 - 0.45]);
    spots.push([lot.x + lotW / 2 - 0.45, lot.z - lotD / 2 + 0.45]);
  }

  const poleGeometry = new CylinderGeometry(0.05, 0.08, LAMP_HEIGHT, 6);
  const poles = new InstancedMesh(poleGeometry, kit.material("metal"), spots.length);
  const bulbGeometry = new IcosahedronGeometry(0.2, 0);
  const bulbMaterial = new MeshBasicMaterial({ color: palette.halo > 0 ? BULB_NIGHT : BULB_DAY, toneMapped: false });
  const bulbs = new InstancedMesh(bulbGeometry, bulbMaterial, spots.length);
  const haloMap = haloTexture();
  const haloGeometry = new PlaneGeometry(6.4, 6.4);
  const haloMaterial = new MeshBasicMaterial({
    map: haloMap,
    transparent: true,
    opacity: palette.halo,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const halos = new InstancedMesh(haloGeometry, haloMaterial, spots.length);

  spots.forEach(([x, z], i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(x, plate + LAMP_HEIGHT / 2, z);
    dummy.updateMatrix();
    poles.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, plate + LAMP_HEIGHT + 0.12, z);
    dummy.updateMatrix();
    bulbs.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, plate + 0.04, z);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.updateMatrix();
    halos.setMatrixAt(i, dummy.matrix);
  });
  poles.castShadow = true;
  halos.visible = palette.halo > 0;
  halos.renderOrder = 1;
  group.add(poles, bulbs, halos);

  // ─── Voitures : une boucle autour de la ville, une autre autour du pâté central
  const pitchX = lotW + road;
  const pitchZ = lotD + road;
  const outerX = (cols / 2) * pitchX;
  const outerZ = (rows / 2) * pitchZ;
  const innerX = pitchX;
  const innerZ = pitchZ / 2;
  const outer = route([
    [-outerX, -outerZ],
    [outerX, -outerZ],
    [outerX, outerZ],
    [-outerX, outerZ],
  ]);
  const inner = route([
    [-innerX, innerZ],
    [innerX, innerZ],
    [innerX, -innerZ],
    [-innerX, -innerZ],
  ]);
  const fleet: { body: Group; path: Route; offset: number }[] = [];
  const paint: Role[] = ["jaune", "rouge", "bleu", "white", "violet"];
  paint.forEach((role, i) => {
    const path = i < 3 ? outer : inner;
    const body = car(kit, group, role, 0, 0);
    body.scale.setScalar(0.82);
    // Les ombres sont figées : une voiture qui roule n'en projette pas
    body.traverse((child) => {
      child.castShadow = false;
    });
    fleet.push({ body, path, offset: (path.length / (i < 3 ? 3 : 2)) * (i % 3) + i * 3 });
  });

  // ─── Balise de l'arrêt actif
  const beaconGeometry = new OctahedronGeometry(0.5);
  const beaconMaterial = new MeshBasicMaterial({ toneMapped: false });
  const beacon = new Mesh(beaconGeometry, beaconMaterial);
  beacon.visible = false;
  group.add(beacon);
  let beaconY = 0;
  let current = palette;

  const a = new Color();
  const b = new Color();

  return {
    group,

    setPalette(from, to, mix) {
      current = mix < 0.5 ? from : to;
      haloMaterial.opacity = from.halo + (to.halo - from.halo) * mix;
      halos.visible = haloMaterial.opacity > 0.01;
      bulbMaterial.color.lerpColors(
        a.setHex(from.halo > 0 ? BULB_NIGHT : BULB_DAY),
        b.setHex(to.halo > 0 ? BULB_NIGHT : BULB_DAY),
        mix,
      );
    },

    setBeacon(at, tone, amount) {
      beacon.visible = Boolean(at) && amount > 0.02;
      if (!at) return;
      beacon.position.set(at.x, at.y, at.z);
      beaconY = at.y;
      beacon.scale.setScalar(Math.max(0.001, amount));
      beaconMaterial.color.setHex(current.roles[tone]);
    },

    tick(time, dt) {
      for (const vehicle of fleet) {
        const pose = along(vehicle.path, vehicle.offset + time * CAR_SPEED);
        vehicle.body.position.set(pose.x, 0.06, pose.z);
        // Le cap rattrape la direction de la rue : les virages ne sont pas des à-coups
        const turn = Math.atan2(Math.sin(pose.heading - vehicle.body.rotation.y), Math.cos(pose.heading - vehicle.body.rotation.y));
        vehicle.body.rotation.y += turn * Math.min(1, dt * 9);
      }
      if (beacon.visible) {
        beacon.rotation.y = time * 1.4;
        beacon.position.y = beaconY + 0.9 + Math.sin(time * 2.2) * 0.18;
      }
    },

    dispose() {
      poleGeometry.dispose();
      bulbGeometry.dispose();
      bulbMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      haloMap.dispose();
      beaconGeometry.dispose();
      beaconMaterial.dispose();
    },
  };
}
