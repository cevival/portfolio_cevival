// La ville : assemble la scène, tient la boucle de rendu et expose une petite
// interface pilotée par la page. Seul point d'entrée du moteur 3D.
import {
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  NoToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { createGround } from "./ground";
import { createKit } from "./kit";
import { finalePose, tourConfig, type StopId } from "./layout";
import { palettes, type Theme } from "./palette";
import { mixPose, tourState, type Pose } from "./tour";

export interface CityStop {
  id: StopId;
  title: string;
  /** Domaine affiché dans la barre de l'écran géant */
  domain?: string;
  /** Captures du site : 640 px d'abord, 1280 px quand la caméra approche */
  screen?: { small: string; large: string };
}

export interface CityOptions {
  canvas: HTMLCanvasElement;
  theme: Theme;
  /** Les arrêts, dans l'ordre de la visite */
  stops: CityStop[];
  /** Texte du panneau du terrain à bâtir */
  lotLabel: string;
  /** Appelé quand le contexte WebGL est perdu (true) ou retrouvé (false) */
  onContextChange?: (lost: boolean) => void;
}

export type CityView =
  /** 0 → 1 sur la section épinglée : vue d'ensemble puis visite */
  | { kind: "journey"; progress: number }
  /** 0 → 1 sur la section contact */
  | { kind: "finale"; progress: number }
  /** Caméra libre, pour la page de labo et les captures */
  | { kind: "free"; pose: Pose };

export interface CityHandle {
  setView(view: CityView): void;
  setTheme(theme: Theme, animate: boolean): void;
  /** Décale le sujet dans le cadre, en fraction de la largeur et de la hauteur */
  setFraming(x: number, y: number): void;
  setLotLabel(label: string): void;
  /** Position écran d'une ancre de la scène, en pixels CSS */
  project(anchorId: string): { x: number; y: number; visible: boolean } | null;
  resize(): void;
  start(): void;
  stop(): void;
  dispose(): void;
}

// Focale longue : l'aspect d'une illustration isométrique, avec de la vraie profondeur
const FOV = 26;
// Sous ce rapport largeur / hauteur, le champ vertical s'ouvre pour garder la même largeur de ville
const MIN_ASPECT = 1.25;
// Vitesse à laquelle la caméra rattrape sa pose cible
const DAMPING = 12;
const THEME_DURATION = 0.7;
const MAX_PIXEL_RATIO = 1.5;

const smooth = (t: number) => t * t * (3 - 2 * t);

export function createCity(options: CityOptions): CityHandle {
  const { canvas } = options;
  let theme = options.theme;
  let palette = palettes[theme];

  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.toneMapping = NoToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  // La scène est statique : les ombres ne sont calculées qu'à la demande
  renderer.shadowMap.autoUpdate = false;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));

  const scene = new Scene();
  const background = new Color(palette.paper);
  scene.background = background;
  // Brouillard de la couleur du papier : les bords de la scène se fondent dans la page
  const fog = new Fog(palette.paper, 100, 300);
  scene.fog = fog;

  const camera = new PerspectiveCamera(FOV, 1, 1, 900);

  const hemisphere = new HemisphereLight(palette.sky, palette.groundLight, palette.hemisphere);
  scene.add(hemisphere);

  // La lumière vient de la gauche : la face gauche des bâtiments est éclairée,
  // la droite reste dans l'ombre, et les ombres portées partent vers la droite.
  const sun = new DirectionalLight(palette.sun, palette.sunIntensity);
  sun.position.set(-38, 78, 46);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -56;
  sun.shadow.camera.right = 56;
  sun.shadow.camera.top = 56;
  sun.shadow.camera.bottom = -56;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 240;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);

  const kit = createKit(theme);
  const ground = createGround(kit, palette);
  scene.add(ground.group);

  const anchors = new Map<string, Vector3>();

  // ─── Caméra
  let goal: Pose = tourConfig.overview;
  let current: Pose = goal;
  // La première pose est appliquée telle quelle : une page rechargée au milieu
  // de la visite ne doit pas partir de la vue d'ensemble.
  let snap = true;
  let framingX = 0;
  let framingY = 0;
  let width = 1;
  let height = 1;

  function applyFraming() {
    if (framingX === 0 && framingY === 0) camera.clearViewOffset();
    else camera.setViewOffset(width, height, -framingX * width, framingY * height, width, height);
  }

  function applyPose(pose: Pose) {
    const [x, y, z] = pose.target;
    const flat = Math.cos(pose.elevation) * pose.distance;
    camera.position.set(
      x + Math.sin(pose.azimuth) * flat,
      y + Math.sin(pose.elevation) * pose.distance,
      z + Math.cos(pose.azimuth) * flat,
    );
    camera.lookAt(x, y, z);
    fog.near = pose.distance + 25;
    fog.far = pose.distance + 140;
  }

  // ─── Thème
  let themeFrom: Theme = theme;
  let themeMix = 1;

  function paint(from: Theme, to: Theme, mix: number) {
    const a = palettes[from];
    const b = palettes[to];
    kit.setTheme(from, to, mix);
    ground.setPalette(a, b, mix);
    background.lerpColors(new Color(a.paper), new Color(b.paper), mix);
    fog.color.copy(background);
    hemisphere.color.lerpColors(new Color(a.sky), new Color(b.sky), mix);
    hemisphere.groundColor.lerpColors(new Color(a.groundLight), new Color(b.groundLight), mix);
    hemisphere.intensity = a.hemisphere + (b.hemisphere - a.hemisphere) * mix;
    sun.color.lerpColors(new Color(a.sun), new Color(b.sun), mix);
    sun.intensity = a.sunIntensity + (b.sunIntensity - a.sunIntensity) * mix;
  }

  // ─── Boucle de rendu
  let running = false;
  let lost = false;
  let frame = 0;
  let last = 0;

  function render(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;

    if (themeMix < 1) {
      themeMix = Math.min(1, themeMix + dt / THEME_DURATION);
      paint(themeFrom, theme, smooth(themeMix));
    }

    current = snap ? goal : mixPose(current, goal, 1 - Math.exp(-DAMPING * dt));
    snap = false;
    applyPose(current);

    renderer.render(scene, camera);
  }

  function loop(now: number) {
    if (!running) return;
    frame = requestAnimationFrame(loop);
    render(now);
  }

  function onContextLost(event: Event) {
    // Sans cela le navigateur ne tente jamais de rendre le contexte
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    options.onContextChange?.(true);
  }

  function onContextRestored() {
    lost = false;
    renderer.shadowMap.needsUpdate = true;
    options.onContextChange?.(false);
    if (running) {
      last = 0;
      frame = requestAnimationFrame(loop);
    }
  }

  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  const handle: CityHandle = {
    setView(view) {
      if (view.kind === "journey") goal = tourState(view.progress, tourConfig).pose;
      else if (view.kind === "finale") goal = finalePose(view.progress);
      else goal = view.pose;
    },

    setTheme(next, animate) {
      if (next === theme && themeMix >= 1) return;
      themeFrom = theme;
      theme = next;
      palette = palettes[next];
      themeMix = animate ? 0 : 1;
      if (!animate) paint(themeFrom, theme, 1);
      renderer.shadowMap.needsUpdate = true;
      // Une image tout de suite : la bascule en cercle prend un instantané de la page
      if (!animate && !lost) render(performance.now());
    },

    setFraming(x, y) {
      framingX = x;
      framingY = y;
      applyFraming();
      camera.updateProjectionMatrix();
    },

    setLotLabel() {},

    project(anchorId) {
      const anchor = anchors.get(anchorId);
      if (!anchor) return null;
      const point = anchor.clone().project(camera);
      return {
        x: (point.x * 0.5 + 0.5) * width,
        y: (-point.y * 0.5 + 0.5) * height,
        visible: point.z < 1 && Math.abs(point.x) <= 1.1 && Math.abs(point.y) <= 1.1,
      };
    },

    resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      width = w;
      height = h;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      // Écran étroit : on ouvre le champ vertical pour garder la même largeur de ville
      const half = Math.tan((FOV * Math.PI) / 360) * Math.max(1, MIN_ASPECT / aspect);
      camera.fov = (Math.atan(half) * 360) / Math.PI;
      applyFraming();
      camera.updateProjectionMatrix();
    },

    start() {
      if (running) return;
      running = true;
      last = 0;
      if (!lost) frame = requestAnimationFrame(loop);
    },

    stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    },

    dispose() {
      handle.stop();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      ground.dispose();
      kit.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
    },
  };

  handle.resize();
  renderer.shadowMap.needsUpdate = true;
  return handle;
}
