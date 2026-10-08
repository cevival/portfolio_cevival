// Enseignes : du texte ou un pictogramme dessiné dans un canvas 2D, plaqué
// sur un plan sans éclairage. La nuit ce sont des néons, le jour des plaques.
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type Object3D,
} from "three";
import { palettes, type Theme, type Tone } from "./palette";

export interface SignInk {
  night: boolean;
  /** Fond de la plaque */
  plate: string;
  /** Couleur du texte */
  text: string;
  /** Couleur d'accent du projet */
  accent: string;
}

export type Painter = (ctx: CanvasRenderingContext2D, w: number, h: number, ink: SignInk) => void;

export interface SignPlace {
  x: number;
  y: number;
  z: number;
  rotY: number;
  w: number;
  h: number;
  tone: Tone;
  /** Inclinaison vers l'arrière, en radians */
  tilt?: number;
}

export interface Sign {
  mesh: Mesh;
  /** Change ce qui est dessiné (langue du panneau du terrain, par exemple) */
  repaint(painter: Painter): void;
}

export interface Signs {
  plate(lotIndex: number, parent: Object3D, painter: Painter, at: SignPlace): Sign;
  setTheme(theme: Theme): void;
  /** Une valeur 0 → 1 par parcelle : l'enseigne de l'arrêt actif brille davantage */
  setActive(amounts: readonly number[]): void;
  dispose(): void;
}

const DISPLAY = '"Funnel Display Variable", ui-sans-serif, system-ui, sans-serif';
const MONO = '"JetBrains Mono Variable", ui-monospace, Consolas, monospace';
// Pixels de texture par unité de la scène
const DENSITY = 88;
const hex = (color: number) => `#${color.toString(16).padStart(6, "0")}`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function plateBackground(ctx: CanvasRenderingContext2D, w: number, h: number, ink: SignInk) {
  const r = Math.min(w, h) * 0.18;
  roundRect(ctx, 2, 2, w - 4, h - 4, r);
  ctx.fillStyle = ink.plate;
  ctx.fill();
  ctx.lineWidth = Math.max(3, h * 0.045);
  ctx.strokeStyle = ink.accent;
  ctx.stroke();
}

function glow(ctx: CanvasRenderingContext2D, ink: SignInk, size: number) {
  ctx.shadowColor = ink.night ? ink.accent : "transparent";
  ctx.shadowBlur = ink.night ? size : 0;
}

/** Plaque portant un nom */
export const label =
  (text: string): Painter =>
  (ctx, w, h, ink) => {
    plateBackground(ctx, w, h, ink);
    let size = h * 0.56;
    ctx.font = `700 ${size}px ${DISPLAY}`;
    const room = w * 0.84;
    const measured = ctx.measureText(text).width;
    if (measured > room) {
      size *= room / measured;
      ctx.font = `700 ${size}px ${DISPLAY}`;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    glow(ctx, ink, size * 0.35);
    ctx.fillStyle = ink.night ? ink.accent : ink.text;
    ctx.fillText(text, w / 2, h / 2 + size * 0.04);
  };

/** Panneau du terrain à bâtir : deux lignes, texte du haut plus petit */
export const billboard =
  (small: string, big: string): Painter =>
  (ctx, w, h, ink) => {
    plateBackground(ctx, w, h, ink);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink.night ? "#e9e6fb" : ink.text;
    ctx.font = `600 ${h * 0.14}px ${MONO}`;
    ctx.fillText(small.toUpperCase(), w / 2, h * 0.27);
    let size = h * 0.34;
    ctx.font = `700 ${size}px ${DISPLAY}`;
    const measured = ctx.measureText(big).width;
    if (measured > w * 0.86) {
      size *= (w * 0.86) / measured;
      ctx.font = `700 ${size}px ${DISPLAY}`;
    }
    glow(ctx, ink, size * 0.3);
    ctx.fillStyle = ink.night ? ink.accent : ink.text;
    ctx.fillText(big, w / 2, h * 0.62);
    if (!ink.night) {
      const bar = Math.min(w * 0.86, ctx.measureText(big).width);
      ctx.fillStyle = ink.accent;
      ctx.fillRect((w - bar) / 2, h * 0.82, bar, h * 0.045);
    }
  };

/** Barre de navigateur au-dessus d'un écran géant : trois points et le domaine */
export const browserBar =
  (domain: string): Painter =>
  (ctx, w, h, ink) => {
    ctx.fillStyle = ink.night ? "#1b1731" : "#efebff";
    ctx.fillRect(0, 0, w, h);
    const r = h * 0.15;
    ["#ff6a55", "#f7df1e", "#4cc27f"].forEach((dot, i) => {
      ctx.beginPath();
      ctx.arc(h * 0.6 + i * r * 3.2, h / 2, r, 0, Math.PI * 2);
      ctx.fillStyle = dot;
      ctx.fill();
    });
    ctx.font = `600 ${h * 0.46}px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink.night ? "#d8d3f5" : "#16132a";
    ctx.fillText(domain, w / 2, h / 2 + h * 0.03);
  };

function disc(ctx: CanvasRenderingContext2D, w: number, h: number, ink: SignInk) {
  const r = Math.min(w, h) / 2 - 4;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = ink.plate;
  ctx.fill();
  ctx.lineWidth = r * 0.12;
  ctx.strokeStyle = ink.accent;
  ctx.stroke();
  return r;
}

function stroke(ctx: CanvasRenderingContext2D, ink: SignInk, width: number) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = ink.accent;
  glow(ctx, ink, width * 1.2);
  ctx.stroke();
}

/** Pictogrammes, dessinés dans un disque */
export const icon = {
  /** Coche : la qualité validée (QualiTrack) */
  check: ((ctx, w, h, ink) => {
    const r = disc(ctx, w, h, ink);
    ctx.beginPath();
    ctx.moveTo(w / 2 - r * 0.42, h / 2 + r * 0.02);
    ctx.lineTo(w / 2 - r * 0.1, h / 2 + r * 0.34);
    ctx.lineTo(w / 2 + r * 0.46, h / 2 - r * 0.32);
    stroke(ctx, ink, r * 0.2);
  }) as Painter,

  /** Dent (cabinet dentaire) */
  tooth: ((ctx, w, h, ink) => {
    const r = disc(ctx, w, h, ink);
    const cx = w / 2;
    const cy = h / 2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.42, cy - r * 0.28);
    ctx.bezierCurveTo(cx - r * 0.42, cy - r * 0.62, cx - r * 0.08, cy - r * 0.56, cx, cy - r * 0.42);
    ctx.bezierCurveTo(cx + r * 0.08, cy - r * 0.56, cx + r * 0.42, cy - r * 0.62, cx + r * 0.42, cy - r * 0.28);
    ctx.bezierCurveTo(cx + r * 0.42, cy + r * 0.1, cx + r * 0.3, cy + r * 0.56, cx + r * 0.18, cy + r * 0.56);
    ctx.bezierCurveTo(cx + r * 0.08, cy + r * 0.56, cx + r * 0.1, cy + r * 0.12, cx, cy + r * 0.12);
    ctx.bezierCurveTo(cx - r * 0.1, cy + r * 0.12, cx - r * 0.08, cy + r * 0.56, cx - r * 0.18, cy + r * 0.56);
    ctx.bezierCurveTo(cx - r * 0.3, cy + r * 0.56, cx - r * 0.42, cy + r * 0.1, cx - r * 0.42, cy - r * 0.28);
    ctx.closePath();
    glow(ctx, ink, r * 0.25);
    ctx.fillStyle = ink.accent;
    ctx.fill();
  }) as Painter,

  /** Croix (cabinet médical) */
  cross: ((ctx, w, h, ink) => {
    const r = disc(ctx, w, h, ink);
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 2 - r * 0.46);
    ctx.lineTo(w / 2, h / 2 + r * 0.46);
    ctx.moveTo(w / 2 - r * 0.46, h / 2);
    ctx.lineTo(w / 2 + r * 0.46, h / 2);
    stroke(ctx, ink, r * 0.26);
  }) as Painter,

  /** Marque déposée */
  registered: ((ctx, w, h, ink) => {
    const r = disc(ctx, w, h, ink);
    ctx.font = `700 ${r * 1.25}px ${DISPLAY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    glow(ctx, ink, r * 0.3);
    ctx.fillStyle = ink.accent;
    ctx.fillText("R", w / 2, h / 2 + r * 0.06);
  }) as Painter,

  /** Chevrons de code, sur un écran de façade */
  code: ((ctx, w, h, ink) => {
    ctx.fillStyle = ink.night ? "#141126" : "#16132a";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `700 ${h * 0.5}px ${MONO}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = ink.accent;
    ctx.shadowBlur = h * 0.12;
    ctx.fillStyle = ink.night ? ink.accent : "#a596ff";
    ctx.fillText("</>", w / 2, h / 2 + h * 0.03);
  }) as Painter,

  /** Monogramme GD, sur le drapeau de l'atelier */
  monogram: ((ctx, w, h, ink) => {
    ctx.fillStyle = ink.accent;
    ctx.fillRect(0, 0, w, h);
    ctx.font = `800 ${h * 0.6}px ${DISPLAY}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("GD", w / 2, h / 2 + h * 0.04);
  }) as Painter,
};

interface Entry {
  lot: number;
  tone: Tone;
  painter: Painter;
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
  material: MeshBasicMaterial;
  mesh: Mesh;
}

export function createSigns(theme: Theme): Signs {
  let current = theme;
  const entries: Entry[] = [];

  function draw(entry: Entry) {
    const ctx = entry.canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = entry.canvas;
    const night = current === "dark";
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    entry.painter(ctx, w, h, {
      night,
      plate: night ? "#141126" : "#ffffff",
      text: "#16132a",
      accent: hex(palettes[current].roles[entry.tone]),
    });
    ctx.restore();
    entry.texture.needsUpdate = true;
  }

  // Le texte dessiné avant le chargement de la police l'est dans la police de repli
  if (typeof document !== "undefined" && document.fonts) {
    Promise.all([
      document.fonts.load('700 48px "Funnel Display Variable"'),
      document.fonts.load('600 24px "JetBrains Mono Variable"'),
    ])
      .then(() => entries.forEach(draw))
      .catch(() => {});
  }

  return {
    plate(lotIndex, parent, painter, at) {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 640 / (at.w * DENSITY));
      canvas.width = Math.round(at.w * DENSITY * scale);
      canvas.height = Math.round(at.h * DENSITY * scale);
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 4;
      const material = new MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.5,
        toneMapped: false,
      });
      const mesh = new Mesh(new PlaneGeometry(at.w, at.h), material);
      mesh.rotation.order = "YXZ";
      mesh.rotation.set(-(at.tilt ?? 0), at.rotY, 0);
      mesh.position.set(at.x, at.y, at.z);
      parent.add(mesh);

      const entry: Entry = { lot: lotIndex, tone: at.tone, painter, canvas, texture, material, mesh };
      entries.push(entry);
      draw(entry);
      return {
        mesh,
        repaint(next) {
          entry.painter = next;
          draw(entry);
        },
      };
    },

    setTheme(next) {
      if (next === current) return;
      current = next;
      entries.forEach(draw);
    },

    setActive(amounts) {
      // De nuit, les enseignes au repos sont en veilleuse
      const idle = current === "dark" ? 0.72 : 1;
      for (const entry of entries) {
        entry.material.color.setScalar(idle + (1 - idle) * (amounts[entry.lot] ?? 0));
      }
    },

    dispose() {
      for (const entry of entries) {
        entry.mesh.geometry.dispose();
        entry.texture.dispose();
        entry.material.dispose();
      }
      entries.length = 0;
    },
  };
}
