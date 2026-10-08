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
import { builders, lotBillboard } from "./buildings";
import { createGround } from "./ground";
import { createKit } from "./kit";
import { CITY, LOTS, finalePose, tourConfig, type StopId } from "./layout";
import { palettes, toneAt, type Theme } from "./palette";
import { createProps } from "./props";
import { createScreens } from "./screens";
import { createSigns, type Sign } from "./signs";
import { mixPose, tourState, type Pose } from "./tour";
import { createWindows } from "./windows";

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
  | { kind: "free"; pose: Pose; active?: number };

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
// Rapport largeur / hauteur pour lequel les poses de la visite sont réglées
const MIN_ASPECT = 1.25;
// Vitesse à laquelle la caméra rattrape sa pose cible
const DAMPING = 12;
const THEME_DURATION = 0.7;
const MAX_PIXEL_RATIO = 1.5;
// Résolution adaptative : après quelques images de mise en route, on mesure
// les suivantes ; trop lentes, le canvas repasse à un pixel par pixel CSS.
const WARM_UP_FRAMES = 12;
const SAMPLED_FRAMES = 40;
const SLOW_FRAME_MS = 22;
// Vitesse à laquelle un bâtiment s'allume ou s'éteint
const LIGHT_UP = 5;
// En vue d'ensemble, toute la ville est à mi-régime
const OVERVIEW_GLOW = 0.45;


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
  let pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  renderer.setPixelRatio(pixelRatio);

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

  // ─── Les douze parcelles
  const windows = createWindows(palette);
  const signs = createSigns(theme);
  const screens = createScreens(kit, signs, palette, renderer.capabilities.getMaxAnisotropy());

  let lotSign: Sign | null = null;

  LOTS.forEach((lot, lotIndex) => {
    const stop = options.stops.find((candidate) => candidate.id === lot.id);
    const group = builders[lot.id]({
      kit,
      windows,
      signs,
      screens,
      lotIndex,
      tone: toneAt(lotIndex),
      title: stop?.title ?? lot.id,
      facing: tourConfig.stops[lotIndex].azimuth,
      lotLabel: options.lotLabel,
    });
    group.position.set(lot.x, CITY.plate, lot.z);
    scene.add(group);

    if (stop?.screen) screens.load(lotIndex, stop.screen, stop.domain ?? "");
    // L'étiquette HTML s'accroche au-dessus de l'écran, ou du panneau pour le terrain
    const anchor =
      screens.anchor(lotIndex) ??
      (group.userData.anchor instanceof Vector3 ? group.localToWorld(group.userData.anchor.clone()) : null);
    if (anchor) anchors.set(`label:${lot.id}`, anchor);
    if (group.userData.sign) lotSign = group.userData.sign as Sign;
  });
  windows.build(scene);

  const props = createProps(kit, palette);
  scene.add(props.group);

  // Éclairage de chaque parcelle, de 0 (au repos) à 1 (arrêt actif)
  const glow = LOTS.map(() => OVERVIEW_GLOW);
  let active = -1;
  let allLit = false;

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

  // Le sujet n'occupe que la part du cadre laissée libre par le texte : quand
  // cette part est étroite (texte à côté, ou écran en hauteur), le champ
  // s'ouvre pour que la ville y tienne toujours en entier.
  function applyLens() {
    const base = Math.tan((FOV * Math.PI) / 360);
    const freeWidth = 1 - 2 * Math.abs(framingX);
    const freeHeight = 1 - 2 * Math.abs(framingY);
    const half = base * Math.max(1 / freeHeight, MIN_ASPECT / (camera.aspect * freeWidth));
    camera.fov = (Math.atan(half) * 360) / Math.PI;
    camera.updateProjectionMatrix();
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
    windows.setPalette(a, b, mix);
    screens.setPalette(a, b, mix);
    props.setPalette(a, b, mix);
    // Les enseignes sont redessinées d'un coup, à mi-parcours
    signs.setTheme(mix < 0.5 ? from : to);
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
  let framesSeen = 0;
  let sampledMs = 0;

  function render(now: number) {
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
    last = now;

    if (themeMix < 1) {
      themeMix = Math.min(1, themeMix + dt / THEME_DURATION);
      paint(themeFrom, theme, smooth(themeMix));
    }

    const ease = snap ? 1 : 1 - Math.exp(-LIGHT_UP * dt);
    glow.forEach((value, i) => {
      const target = allLit ? 1 : active < 0 ? OVERVIEW_GLOW : i === active ? 1 : 0;
      glow[i] = value + (target - value) * ease;
    });
    windows.setActive(glow);
    signs.setActive(glow);
    screens.setActive(glow, active);
    windows.tick(now / 1000);

    // La balise flotte au-dessus de l'écran de l'arrêt actif
    const pinned = active >= 0 ? anchors.get(`label:${LOTS[active].id}`) : undefined;
    props.setBeacon(pinned ?? null, toneAt(Math.max(0, active)), active >= 0 ? glow[active] : 0);
    props.tick(now / 1000, dt);

    current = snap ? goal : mixPose(current, goal, 1 - Math.exp(-DAMPING * dt));
    snap = false;
    applyPose(current);

    renderer.render(scene, camera);

    if (pixelRatio > 1 && framesSeen < WARM_UP_FRAMES + SAMPLED_FRAMES) {
      framesSeen++;
      if (framesSeen > WARM_UP_FRAMES) sampledMs += dt * 1000;
      if (framesSeen === WARM_UP_FRAMES + SAMPLED_FRAMES && sampledMs / SAMPLED_FRAMES > SLOW_FRAME_MS) {
        pixelRatio = 1;
        renderer.setPixelRatio(1);
        handle.resize();
      }
    }
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
      allLit = view.kind === "finale";
      if (view.kind === "journey") {
        const state = tourState(view.progress, tourConfig);
        goal = state.pose;
        active = state.active;
      } else if (view.kind === "finale") {
        goal = finalePose(view.progress);
        active = -1;
      } else {
        goal = view.pose;
        active = view.active ?? -1;
      }
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
      applyLens();
    },

    setLotLabel(text) {
      lotSign?.repaint(lotBillboard(text));
    },

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
      camera.aspect = w / h;
      applyFraming();
      applyLens();
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
      props.dispose();
      windows.dispose();
      screens.dispose();
      signs.dispose();
      kit.dispose();
      sun.shadow.map?.dispose();
      renderer.dispose();
    },
  };

  handle.resize();
  renderer.shadowMap.needsUpdate = true;
  if (import.meta.env.DEV) Object.assign(handle, { info: renderer.info });
  return handle;
}
