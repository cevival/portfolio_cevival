// Écrans géants : au-dessus de chaque bâtiment, la vraie capture du site,
// dans un cadre à barre de navigateur. L'écran de l'arrêt actif est à pleine luminosité.
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type Object3D,
  type Texture,
} from "three";
import type { Kit } from "./kit";
import type { Palette, Tone } from "./palette";
import { browserBar, type Signs } from "./signs";

export interface ScreenPlace {
  x: number;
  /** Hauteur du point d'appui : les pieds descendent jusque-là */
  y: number;
  z: number;
  /** Direction vers laquelle l'écran regarde (l'azimut de la caméra à cet arrêt) */
  rotY: number;
  /** Longueur des pieds */
  legs?: number;
  /** Largeur de l'image ; la hauteur suit en 16:10 */
  width?: number;
}

export interface Screens {
  mount(lotIndex: number, parent: Object3D, tone: Tone, at: ScreenPlace): void;
  load(lotIndex: number, urls: { small: string; large: string }, domain: string): void;
  /** Haut de l'écran en coordonnées monde, pour y accrocher une étiquette HTML */
  anchor(lotIndex: number): Vector3 | null;
  setPalette(from: Palette, to: Palette, mix: number): void;
  setActive(amounts: readonly number[]): void;
  dispose(): void;
}

interface Entry {
  lot: number;
  tone: Tone;
  holder: Group;
  image: MeshBasicMaterial;
  bar: Mesh | null;
  barPlace: { w: number; h: number; y: number };
  top: number;
  urls: { small: string; large: string } | null;
  texture: Texture | null;
  sharp: boolean;
}

const TILT = 0.13;
const BAR = 0.46;
const RIM = 0.2;
// En dessous de cette valeur d'activité, la petite capture suffit
const SHARP_FROM = 0.2;
// Activité à partir de laquelle l'écran est entièrement déployé. En vue
// d'ensemble tous le sont ; pendant la visite, les écrans des parcelles
// voisines se replient pour ne pas masquer le bâtiment visé.
const OPEN_AT = 0.3;

// Dépasse un peu sa cible avant de s'y poser
const overshoot = (t: number) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

export function createScreens(kit: Kit, signs: Signs, palette: Palette, maxAnisotropy: number): Screens {
  const entries = new Map<number, Entry>();
  const loader = new TextureLoader();
  const geometries: PlaneGeometry[] = [];
  let idle = palette.screenIdle;
  let active: readonly number[] = [];

  function show(entry: Entry, url: string) {
    loader.load(url, (texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
      entry.texture?.dispose();
      entry.texture = texture;
      entry.image.map = texture;
      entry.image.needsUpdate = true;
      refresh(entry);
    });
  }

  function refresh(entry: Entry) {
    const amount = active[entry.lot] ?? 0;
    // Sans capture, l'écran reste sombre plutôt que blanc
    const level = entry.texture ? idle + (1 - idle) * amount : 0.16;
    entry.image.color.setScalar(level);

    const open = Math.min(1, amount / OPEN_AT);
    entry.holder.visible = open > 0.02;
    entry.holder.scale.setScalar(Math.max(0.001, overshoot(open)));
    if (!entry.sharp && entry.urls && amount > SHARP_FROM) {
      entry.sharp = true;
      show(entry, entry.urls.large);
    }
  }

  return {
    mount(lotIndex, parent, tone, at) {
      const w = at.width ?? 7.2;
      const h = (w * 10) / 16;
      const legs = at.legs ?? 0.7;

      const holder = new Group();
      // L'inclinaison se fait dans le repère de l'écran, après son orientation
      holder.rotation.order = "YXZ";
      holder.rotation.set(-TILT, at.rotY, 0);
      holder.position.set(at.x, at.y, at.z);
      parent.add(holder);

      // Pieds et cadre
      // Pas d'ombre portée : les ombres sont figées, celle d'un écran replié resterait au sol
      kit.cyl(holder, "metal", 0.11, 0.11, legs + 0.3, -w * 0.32, 0, -0.16, 6).castShadow = false;
      kit.cyl(holder, "metal", 0.11, 0.11, legs + 0.3, w * 0.32, 0, -0.16, 6).castShadow = false;
      kit.box(holder, "dark", w + RIM * 2, h + BAR + RIM * 2, 0.28, 0, legs, -0.16).castShadow = false;

      const image = new MeshBasicMaterial({ color: 0x29244d, toneMapped: false });
      const plane = new PlaneGeometry(w, h);
      geometries.push(plane);
      const face = new Mesh(plane, image);
      face.position.set(0, legs + RIM + h / 2, 0);
      holder.add(face);

      entries.set(lotIndex, {
        lot: lotIndex,
        tone,
        holder,
        image,
        bar: null,
        barPlace: { w, h: BAR, y: legs + RIM + h + BAR / 2 },
        top: legs + RIM * 2 + h + BAR,
        urls: null,
        texture: null,
        sharp: false,
      });
    },

    load(lotIndex, urls, domain) {
      const entry = entries.get(lotIndex);
      if (!entry) return;
      entry.urls = urls;
      if (!entry.bar) {
        const { w, h, y } = entry.barPlace;
        entry.bar = signs.plate(lotIndex, entry.holder, browserBar(domain), {
          x: 0,
          y,
          z: 0,
          rotY: 0,
          w,
          h,
          tone: entry.tone,
        }).mesh;
      }
      show(entry, urls.small);
    },

    anchor(lotIndex) {
      const entry = entries.get(lotIndex);
      if (!entry) return null;
      entry.holder.updateWorldMatrix(true, false);
      return entry.holder.localToWorld(new Vector3(0, entry.top + 0.4, 0));
    },

    setPalette(from, to, mix) {
      idle = from.screenIdle + (to.screenIdle - from.screenIdle) * mix;
      for (const entry of entries.values()) refresh(entry);
    },

    setActive(amounts) {
      active = amounts;
      for (const entry of entries.values()) refresh(entry);
    },

    dispose() {
      for (const entry of entries.values()) {
        entry.texture?.dispose();
        entry.image.dispose();
      }
      for (const geometry of geometries) geometry.dispose();
      entries.clear();
    },
  };
}
