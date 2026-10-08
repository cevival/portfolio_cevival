# Ville 3D pilotée au scroll — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer tout le style du portfolio par une ville low-poly en vraie 3D dont la caméra voyage de bâtiment en bâtiment au défilement, chaque bâtiment étant un site livré.

**Architecture:** Un moteur Three.js isolé dans `src/city/` (TypeScript pur, chargé en différé) dessine dans un unique canvas fixe derrière la page. Une fonction pure convertit la progression du scroll en pose de caméra et en arrêt actif ; un composant React tient la boucle qui mesure le scroll et pilote le moteur. Les textes restent du HTML rendu côté serveur, les sections du milieu passent sur la ville comme un rideau.

**Tech Stack:** Astro 7, React 19, Tailwind CSS 4, TypeScript, Three.js 0.186, Motion 14, Lenis 1.3, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-10-08-portfolio-ville-3d-scroll-design.md`

## Global Constraints

- Les jetons de couleur du thème sombre ne changent pas : `--paper #0f0d1a`, `--surface #171427`, `--ink #f3f1fb`, `--muted #a7a3c0`, `--rule #2a2642`, `--violet #7a62ff`, `--accent #a596ff`, `--accent-solid #6a4df5`.
- Thème clair : `--paper #f8f6ff`, `--surface #efebff`, `--rule #dcd7f0`, `--ink #16132a`, `--muted #5d5a72`, `--violet #5a3ee6`.
- Polices : Funnel Display (titres), Funnel Sans (texte), JetBrains Mono (méta), toutes via `@fontsource-variable`. Zéro requête vers un domaine tiers.
- Aucun modèle 3D importé ; `src/city/tour.ts` et `src/city/layout.ts` n'importent pas `three` (ils sont utilisés par le bundle initial).
- Les animations ne sont jamais conditionnées à `prefers-reduced-motion` (`MotionConfig reducedMotion="never"` conservé).
- Distance épinglée de la visite : 7 hauteurs de fenêtre (1 + 11 × 0,5 + 0,5), pause de 20 % à chaque bout d'un trajet.
- Rapport de pixels du canvas ≤ 1,5 ; il passe à 1 au-delà de 22 ms par image en moyenne sur les 40 premières.
- Contenu : identifiants de section inchangés (`top`, `projects`, `stack`, `experience`, `about`, `contact`) ; Three.js n'est pas ajouté à la section Stack.
- Git : branche `feat/city-scroll`, commits atomiques en anglais (Conventional Commits), **sans ligne `Co-Authored-By`**, rien n'est poussé. `.vscode/extensions.json` (modifié hors de ce chantier) n'entre dans aucun commit.
- Commentaires de code en français, comme le reste du dépôt.

## Review Focus

1. **Progression non finie** (section de hauteur nulle pendant un redimensionnement → division par zéro) : la caméra doit rester sur une pose valide. → test unitaire, tâche 2.
2. **Rechargement ou lien profond au milieu de la page** (`#stack`, milieu de visite) : l'arrêt actif et la vue doivent être justes dès la première image, sans passage par le hero. → vérification CDP, tâche 6.
3. **Redimensionnement et rotation en cours de visite** : le canvas suit, l'arrêt actif ne saute pas, pas de débordement horizontal. → vérification CDP, tâche 9.
4. **Contexte WebGL perdu ou indisponible** : jamais de rectangle noir ; l'image de la ville et la liste classique prennent le relais. → vérification CDP, tâche 9.
5. **Navigation au clavier** : le focus n'entre jamais dans une fiche invisible, les boutons du rail déplacent la page, « Passer la visite » fonctionne. → vérification CDP, tâche 6.

Les parties visuelles (bâtiments, lumières, mise en page) ne se règlent que sur rendu réel : leurs étapes donnent la recette et le critère d'acceptation, pas un code figé. Le code est donné en entier là où il est déterministe (logique de visite, interfaces, boucle de scroll).

---

## Fichiers

| Fichier | Rôle |
|---|---|
| `src/city/tour.ts` + `tour.test.ts` | Progression → pose de caméra, arrêt actif, fondus |
| `src/city/layout.ts` | Plan de la ville, pose de chaque arrêt, pose du final |
| `src/city/palette.ts` | Couleurs jour / nuit par rôle |
| `src/city/kit.ts` | Primitives low-poly, matériaux partagés par rôle |
| `src/city/ground.ts` | Socle, rues, marquages, sol lointain et grille |
| `src/city/windows.ts` | Fenêtres instanciées et leur allumage |
| `src/city/signs.ts` | Enseignes dessinées dans un canvas 2D |
| `src/city/screens.ts` | Écrans géants (captures des sites) |
| `src/city/props.ts` | Arbres, lampadaires, voitures, balise |
| `src/city/buildings/*.ts` | Un bâtiment par fichier |
| `src/city/index.ts` | `createCity` : assemble la scène, tient la boucle de rendu |
| `src/components/city/CityContext.tsx` | État partagé : statut, arrêt actif, `goToStop` |
| `src/components/city/CityStage.tsx` | Canvas fixe, image d'attente, chargement différé, boucle de scroll |
| `src/components/sections/Journey.tsx` | Hero et visite (HTML) |
| `src/components/sections/{Stack,Experience,About,Contact}.tsx` | Réécrits |
| `src/components/{Portfolio,Navbar}.tsx` | Réécrits |
| `src/components/motion/{Reveal,SmoothScroll}.tsx` | Adaptés |
| `src/lib/scroll.ts` | `scrollToY` via Lenis |
| `src/data/tour.ts`, `src/data/projects.ts` | Les 12 arrêts ; couleur sur chaque projet |
| `src/i18n/translations.ts` | Nouveaux libellés |
| `src/styles/global.css` | Réécrit |
| `src/layouts/Layout.astro` | Polices, méta sociales |
| `vitest.config.ts`, `package.json`, `.github/workflows/deploy.yml` | Outillage |

Supprimés en fin de chantier : `src/components/BrowserFrame.tsx`, `src/components/motion/Ticker.tsx`, `src/hooks/useReveal.ts`, `src/components/sections/{Hero,Projects}.tsx`.

---

### Task 1 : Outillage

**Files:**
- Modify: `package.json`, `package-lock.json`, `.github/workflows/deploy.yml`
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: commandes `npm test` (Vitest) et `npm run check` (`astro check`).

- [ ] **Step 1 : installer les dépendances**

```bash
npm install three @fontsource-variable/funnel-display @fontsource-variable/funnel-sans
npm install -D @types/three vitest @astrojs/check typescript
```

`@astrojs/check` et `typescript` sont aujourd'hui présents dans `node_modules` sans figurer dans `package.json` : `npm install` les élaguerait et `astro check` ne tournerait plus. Les déclarer règle les deux.

- [ ] **Step 2 : scripts et configuration Vitest**

Dans `package.json`, ajouter aux scripts : `"check": "astro check"` et `"test": "vitest run"`.

`vitest.config.ts` :

```ts
import { defineConfig } from "vitest/config";

// Tests de logique pure uniquement : pas besoin de la configuration Astro.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 3 : étape de test dans la CI**

Dans `.github/workflows/deploy.yml`, job `ci`, entre « Type check » et « Build » :

```yaml
      - name: 🧪 Unit tests
        run: npm test
```

- [ ] **Step 4 : vérifier**

Run: `npx astro check && npm run build`
Expected: 0 erreur, build OK (rien n'a changé à l'écran).

- [ ] **Step 5 : commit**

```bash
git add package.json package-lock.json vitest.config.ts .github/workflows/deploy.yml
git commit -m "chore(tooling): add three, vitest and the Funnel type family"
```

---

### Task 2 : Logique de la visite (TDD)

**Files:**
- Create: `src/city/tour.ts`
- Test: `src/city/tour.test.ts`

**Interfaces:**
- Produces:

```ts
export interface Pose {
  target: readonly [number, number, number]; // point visé
  azimuth: number;   // radians ; 0 = caméra côté +z
  elevation: number; // radians au-dessus de l'horizon
  distance: number;  // caméra → cible
}
export interface TourConfig {
  overview: Pose;
  stops: readonly Pose[];
  heroSpan: number; // en hauteurs de fenêtre
  stopSpan: number;
  tailSpan: number;
  dwell: number;    // part de trajet immobile à chaque bout
  lift: number;     // prise de hauteur en milieu de trajet, en fraction de la distance entre cibles
}
export interface TourState {
  pose: Pose;
  active: number;   // -1 pendant le hero
  heroFade: number; // 1 → 0
  tourFade: number; // 0 → 1
}
export function tourLength(cfg: TourConfig): number;
export function stopProgress(index: number, cfg: TourConfig): number;
export function tourState(progress: number, cfg: TourConfig): TourState;
```

- [ ] **Step 1 : écrire les tests**

```ts
import { describe, expect, it } from "vitest";
import { stopProgress, tourLength, tourState, type Pose, type TourConfig } from "./tour";

const pose = (x: number, azimuthDeg: number, distance = 30): Pose => ({
  target: [x, 3, 0],
  azimuth: (azimuthDeg * Math.PI) / 180,
  elevation: 0.55,
  distance,
});

const cfg: TourConfig = {
  overview: { target: [0, 0, 0], azimuth: Math.PI / 4, elevation: 0.66, distance: 100 },
  stops: [pose(-20, 40), pose(-5, 55), pose(10, 35), pose(25, 50)],
  heroSpan: 1,
  stopSpan: 0.5,
  tailSpan: 0.5,
  dwell: 0.2,
  lift: 0.35,
};

const near = (a: Pose, b: Pose) => {
  expect(a.target[0]).toBeCloseTo(b.target[0], 6);
  expect(a.target[1]).toBeCloseTo(b.target[1], 6);
  expect(a.target[2]).toBeCloseTo(b.target[2], 6);
  expect(a.azimuth).toBeCloseTo(b.azimuth, 6);
  expect(a.elevation).toBeCloseTo(b.elevation, 6);
  expect(a.distance).toBeCloseTo(b.distance, 6);
};

describe("tourLength", () => {
  it("additionne le hero, les trajets et la pause finale", () => {
    expect(tourLength(cfg)).toBeCloseTo(1 + 3 * 0.5 + 0.5);
  });

  it("vaut 7 hauteurs de fenêtre pour 12 arrêts", () => {
    const twelve = { ...cfg, stops: Array.from({ length: 12 }, (_, i) => pose(i, 40)) };
    expect(tourLength(twelve)).toBeCloseTo(7);
  });
});

describe("tourState", () => {
  it("part de la vue d'ensemble, texte du hero visible", () => {
    const state = tourState(0, cfg);
    near(state.pose, cfg.overview);
    expect(state.active).toBe(-1);
    expect(state.heroFade).toBe(1);
    expect(state.tourFade).toBe(0);
  });

  it("finit posé sur le dernier arrêt", () => {
    const state = tourState(1, cfg);
    near(state.pose, cfg.stops[3]);
    expect(state.active).toBe(3);
    expect(state.heroFade).toBe(0);
    expect(state.tourFade).toBe(1);
  });

  it("est posé sur chaque arrêt à sa progression", () => {
    cfg.stops.forEach((stop, i) => {
      const state = tourState(stopProgress(i, cfg), cfg);
      near(state.pose, stop);
      expect(state.active).toBe(i);
    });
  });

  it("garde la caméra immobile pendant la pause autour d'un arrêt", () => {
    const pause = (cfg.dwell * cfg.stopSpan * 0.9) / tourLength(cfg);
    const at = stopProgress(1, cfg);
    near(tourState(at - pause, cfg).pose, cfg.stops[1]);
    near(tourState(at + pause, cfg).pose, cfg.stops[1]);
  });

  it("prend de la hauteur entre deux arrêts", () => {
    const mid = (stopProgress(0, cfg) + stopProgress(1, cfg)) / 2;
    const { pose: flying } = tourState(mid, cfg);
    expect(flying.distance).toBeGreaterThan(Math.max(cfg.stops[0].distance, cfg.stops[1].distance));
  });

  it("plonge sans rebond du hero vers le premier arrêt", () => {
    let previous = Infinity;
    for (let i = 0; i <= 200; i++) {
      const { pose: p } = tourState((stopProgress(0, cfg) * i) / 200, cfg);
      expect(p.distance).toBeLessThanOrEqual(previous + 1e-9);
      previous = p.distance;
    }
  });

  it("ne fait jamais reculer l'arrêt actif", () => {
    let previous = -1;
    for (let i = 0; i <= 1000; i++) {
      const { active } = tourState(i / 1000, cfg);
      expect(active).toBeGreaterThanOrEqual(previous);
      previous = active;
    }
  });

  it("reste continu : pas de saut de caméra entre deux images", () => {
    let previous = tourState(0, cfg).pose;
    for (let i = 1; i <= 4000; i++) {
      const { pose: p } = tourState(i / 4000, cfg);
      expect(Math.abs(p.target[0] - previous.target[0])).toBeLessThan(0.2);
      expect(Math.abs(p.distance - previous.distance)).toBeLessThan(0.5);
      expect(Math.abs(p.azimuth - previous.azimuth)).toBeLessThan(0.02);
      previous = p;
    }
  });

  it("tourne par le plus court chemin", () => {
    const wrap: TourConfig = { ...cfg, stops: [pose(0, 350), pose(10, 10)] };
    const mid = (stopProgress(0, wrap) + stopProgress(1, wrap)) / 2;
    const degrees = (tourState(mid, wrap).pose.azimuth * 180) / Math.PI;
    expect(Math.abs(((degrees + 180) % 360) - 180)).toBeLessThan(11);
  });

  it("borne la progression hors de [0, 1]", () => {
    near(tourState(-3, cfg).pose, cfg.overview);
    near(tourState(4, cfg).pose, cfg.stops[3]);
  });

  it("retombe sur la vue d'ensemble si la progression n'est pas un nombre fini", () => {
    for (const bad of [NaN, Infinity, -Infinity]) {
      const state = tourState(bad, cfg);
      expect(Number.isFinite(state.pose.distance)).toBe(true);
      expect(Number.isFinite(state.pose.target[0])).toBe(true);
      expect(state.active).toBeGreaterThanOrEqual(-1);
    }
    near(tourState(NaN, cfg).pose, cfg.overview);
  });
});

describe("stopProgress", () => {
  it("croît avec l'indice et reste dans [0, 1]", () => {
    const values = cfg.stops.map((_, i) => stopProgress(i, cfg));
    values.forEach((v, i) => {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(1);
      if (i > 0) expect(v).toBeGreaterThan(values[i - 1]);
    });
  });

  it("borne l'indice", () => {
    expect(stopProgress(-2, cfg)).toBe(stopProgress(0, cfg));
    expect(stopProgress(99, cfg)).toBe(stopProgress(3, cfg));
  });
});
```

- [ ] **Step 2 : lancer, constater l'échec**

Run: `npm test`
Expected: FAIL, `Cannot find module './tour'`.

- [ ] **Step 3 : implémenter**

```ts
// Logique pure de la visite : aucune dépendance, ni Three.js ni DOM.

export interface Pose {
  /** Point visé */
  target: readonly [number, number, number];
  /** Angle horizontal autour de la cible, en radians (0 = caméra côté +z) */
  azimuth: number;
  /** Angle au-dessus de l'horizon, en radians */
  elevation: number;
  /** Distance caméra → cible */
  distance: number;
}

export interface TourConfig {
  overview: Pose;
  stops: readonly Pose[];
  /** Longueurs de défilement, en hauteurs de fenêtre */
  heroSpan: number;
  stopSpan: number;
  tailSpan: number;
  /** Part de chaque trajet pendant laquelle la caméra reste posée, à chaque bout */
  dwell: number;
  /** Prise de hauteur en milieu de trajet, en fraction de la distance entre cibles */
  lift: number;
}

export interface TourState {
  pose: Pose;
  /** -1 pendant le hero, sinon indice de l'arrêt */
  active: number;
  /** Opacité du texte du hero, 1 → 0 */
  heroFade: number;
  /** Opacité du panneau de visite, 0 → 1 */
  tourFade: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// Départ et arrivée à vitesse nulle
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Écart angulaire signé le plus court de a vers b */
function turn(a: number, b: number) {
  const full = Math.PI * 2;
  return ((((b - a) % full) + full + Math.PI) % full) - Math.PI;
}

function blend(from: Pose, to: Pose, t: number, lift: number): Pose {
  const dx = to.target[0] - from.target[0];
  const dy = to.target[1] - from.target[1];
  const dz = to.target[2] - from.target[2];
  return {
    target: [from.target[0] + dx * t, from.target[1] + dy * t, from.target[2] + dz * t],
    azimuth: from.azimuth + turn(from.azimuth, to.azimuth) * t,
    elevation: lerp(from.elevation, to.elevation, t),
    distance:
      lerp(from.distance, to.distance, t) + lift * Math.hypot(dx, dy, dz) * Math.sin(Math.PI * t),
  };
}

/** Distance de défilement épinglée, en hauteurs de fenêtre */
export function tourLength(cfg: TourConfig) {
  return cfg.heroSpan + (cfg.stops.length - 1) * cfg.stopSpan + cfg.tailSpan;
}

/** Progression à laquelle la caméra est posée sur l'arrêt `index` */
export function stopProgress(index: number, cfg: TourConfig) {
  const i = Math.min(cfg.stops.length - 1, Math.max(0, index));
  return (cfg.heroSpan + i * cfg.stopSpan) / tourLength(cfg);
}

export function tourState(progress: number, cfg: TourConfig): TourState {
  const last = cfg.stops.length - 1;
  // Une progression non finie (section de hauteur nulle) vaut le début
  const travelled = (Number.isFinite(progress) ? clamp01(progress) : 0) * tourLength(cfg);

  // Plongée : de la vue d'ensemble au premier arrêt. Pas de pause au départ,
  // sinon le premier coup de molette ne ferait rien bouger.
  if (travelled < cfg.heroSpan) {
    const t = travelled / cfg.heroSpan;
    return {
      pose: blend(cfg.overview, cfg.stops[0], ease(clamp01(t / (1 - cfg.dwell))), 0),
      active: t < 0.72 ? -1 : 0,
      heroFade: 1 - clamp01(t / 0.45),
      tourFade: clamp01((t - 0.62) / 0.3),
    };
  }

  const along = (travelled - cfg.heroSpan) / cfg.stopSpan;
  const index = Math.min(last, Math.floor(along));
  if (index >= last) {
    return { pose: cfg.stops[last], active: last, heroFade: 0, tourFade: 1 };
  }

  const t = along - index;
  const moving = ease(clamp01((t - cfg.dwell) / (1 - 2 * cfg.dwell)));
  return {
    pose: blend(cfg.stops[index], cfg.stops[index + 1], moving, cfg.lift),
    active: t < 0.5 ? index : index + 1,
    heroFade: 0,
    tourFade: 1,
  };
}
```

- [ ] **Step 4 : lancer, constater le succès**

Run: `npm test`
Expected: tous les tests passent.

- [ ] **Step 5 : commit**

```bash
git add src/city/tour.ts src/city/tour.test.ts
git commit -m "feat(city): map scroll progress to camera poses"
```

---

### Task 3 : Moteur — plan, palette, kit, sol, caméra

**Files:**
- Create: `src/city/layout.ts`, `src/city/palette.ts`, `src/city/kit.ts`, `src/city/ground.ts`, `src/city/index.ts`
- Create (non versionné, supprimé en tâche 11) : `src/pages/lab.astro`

**Interfaces:**
- Consumes: `Pose`, `TourConfig`, `tourState` (tâche 2).
- Produces:

```ts
// layout.ts — sans import de three
export type StopId =
  | "qualitrack" | "dr-salti" | "sasportas" | "points-rambrouch" | "thill-loehr" | "jour-de-rien"
  | "marque" | "lbshop" | "lbdigital-site" | "sc-conduite" | "portfolio" | "lot";
export const STOP_IDS: readonly StopId[];       // ordre de visite
export interface Lot { id: StopId; x: number; z: number; }
export const LOTS: readonly Lot[];              // même ordre que STOP_IDS
export const CITY: { lotW: number; lotD: number; road: number; width: number; depth: number };
export const tourConfig: TourConfig;
export function finalePose(progress: number): Pose;

// palette.ts
export type Theme = "light" | "dark";
export type Role =
  | "slab" | "slabSide" | "road" | "roadMark" | "pavement" | "grass"
  | "wall" | "wallAlt" | "wallDark" | "trim" | "roof" | "glass"
  | "violet" | "rouge" | "jaune" | "bleu" | "vert"
  | "trunk" | "foliage" | "foliageAlt" | "metal" | "dark" | "white";
export interface Palette {
  paper: number;                       // fond de page, fond de scène, brouillard
  rule: number;                        // grille du sol lointain
  roles: Record<Role, number>;
  sky: number; groundLight: number; hemisphere: number;   // lumière d'hémisphère
  sun: number; sunIntensity: number;                      // lumière directionnelle
  shadow: number;                                         // opacité de l'ombre du socle
  windowLit: readonly number[]; windowOff: readonly number[];
  litShare: number;                    // part de fenêtres allumées au repos
  halo: number;                        // opacité des halos de lampadaire
  screenIdle: number;                  // luminosité d'un écran inactif
}
export const palettes: Record<Theme, Palette>;

// kit.ts
export function createKit(theme: Theme): Kit;
export interface Kit {
  material(role: Role): THREE.MeshLambertMaterial;
  box(parent: THREE.Object3D, role: Role, w: number, h: number, d: number, x: number, y: number, z: number): THREE.Mesh;
  cyl(parent: THREE.Object3D, role: Role, rTop: number, rBottom: number, h: number, x: number, y: number, z: number, sides?: number): THREE.Mesh;
  cone(parent: THREE.Object3D, role: Role, r: number, h: number, x: number, y: number, z: number, sides?: number): THREE.Mesh;
  prism(parent: THREE.Object3D, role: Role, w: number, h: number, d: number, x: number, y: number, z: number): THREE.Mesh;
  pyramid(parent: THREE.Object3D, role: Role, w: number, h: number, d: number, x: number, y: number, z: number): THREE.Mesh;
  blob(parent: THREE.Object3D, role: Role, r: number, x: number, y: number, z: number): THREE.Mesh;
  setTheme(from: Theme, to: Theme, mix: number): void;   // mix 0 → 1
  dispose(): void;
}

// index.ts
export interface CityOptions {
  canvas: HTMLCanvasElement;
  theme: Theme;
  stops: { id: StopId; title: string; domain?: string; screen?: { small: string; large: string } }[];
  lotLabel: string;
  onContextChange?: (lost: boolean) => void;
}
export type CityView = { kind: "journey"; progress: number } | { kind: "finale"; progress: number };
export interface CityHandle {
  setView(view: CityView): void;
  setTheme(theme: Theme, animate: boolean): void;
  setFraming(x: number, y: number): void;
  setLotLabel(label: string): void;
  project(anchorId: string): { x: number; y: number; visible: boolean } | null;
  resize(): void;
  start(): void;
  stop(): void;
  dispose(): void;
}
export function createCity(options: CityOptions): CityHandle;
```

- [ ] **Step 1 : `layout.ts`**

Grille 4 × 3 : parcelle de 13 × 12, rue de 3,2. Centre de la parcelle `(col, row)` : `x = (col − 1,5) × 16,2`, `z = (row − 1) × 15,2`. Rangée 0 au fond (z négatif). Ordre en serpentin : rangée 0 de la colonne 0 à 3, rangée 1 de 3 à 0, rangée 2 de 0 à 3. `tourConfig` : `heroSpan 1`, `stopSpan 0.5`, `tailSpan 0.5`, `dwell 0.2`, `lift 0.35` ; vue d'ensemble à azimut 45°, élévation 38°, distance 98 ; chaque arrêt vise le centre de sa parcelle à 3 de haut, distance 30 à 40, élévation 30° à 36°, azimut alterné entre 30° et 60°. `finalePose` : azimut 62° → 28°, élévation 24° → 34°, distance 70 → 96, cible au centre.

- [ ] **Step 2 : `palette.ts` et `kit.ts`**

Un `MeshLambertMaterial({ flatShading: true })` par rôle, créé une fois. Primitives posées sur leur base : `box`, `cyl`, `cone`, `prism` (toit à deux pans), `pyramid`, `blob` (icosaèdre). Géométries unitaires partagées, mises à l'échelle par le maillage. `setTheme(theme, mix)` interpole la couleur de chaque matériau.

- [ ] **Step 3 : `ground.ts`**

Socle épais (dessus `slab`, tranche `slabSide`), rues et marquages légèrement surélevés, une dalle par parcelle. Sol lointain : plan `MeshBasicMaterial` de la couleur exacte du papier, plan `ShadowMaterial` pour l'ombre du socle, grille de lignes couleur `rule` avec brouillard.

- [ ] **Step 4 : `index.ts`**

`WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })`, pas de tone mapping, fond = couleur du papier. `PerspectiveCamera(26)`. Lumière d'hémisphère + directionnelle avec carte d'ombres 2048 figée (`shadowMap.autoUpdate = false`, `needsUpdate` après construction et après changement de thème). Brouillard de la couleur du papier, recalé à chaque image sur la distance de la caméra (`near = d + 25`, `far = d + 120`). La pose issue de `tourState` est amortie (`1 − exp(−12·dt)`) avant d'être appliquée. `setFraming` utilise `camera.setViewOffset`. Écoute `webglcontextlost` / `webglcontextrestored` et appelle `onContextChange`.

- [ ] **Step 5 : page de labo**

`src/pages/lab.astro` (non versionnée) : un canvas plein écran, `createCity`, et des paramètres d'URL `?p=` (progression), `?view=finale`, `?theme=`, `?focus=<StopId>&az=&el=&d=` pour tourner autour d'un bâtiment.

- [ ] **Step 6 : vérifier sur capture**

Run: `npm run dev`, puis capture CDP de `/lab?p=0&theme=dark` et `/lab?p=0&theme=light`.
Expected: le socle et ses 12 parcelles, les rues, la grille qui se fond dans la page sans bord visible, dans les deux thèmes. Console sans erreur.

- [ ] **Step 7 : commit**

```bash
git add src/city/layout.ts src/city/palette.ts src/city/kit.ts src/city/ground.ts src/city/index.ts
git commit -m "feat(city): low-poly kit, ground and camera rig"
```

---

### Task 4 : Les douze parcelles

**Files:**
- Create: `src/city/windows.ts`, `src/city/signs.ts`, `src/city/screens.ts`, `src/city/buildings/{qualitrack,dr-salti,sasportas,garage,station,theatre,marque,shop,studio,driving-school,atelier,lot}.ts`, `src/city/buildings/index.ts`
- Modify: `src/city/index.ts`

**Interfaces:**
- Consumes: kit et palette (tâche 3).
- Produces:

```ts
// windows.ts
export interface Windows {
  grid(lotIndex: number, parent: THREE.Object3D, at: { x: number; y: number; z: number; rotY: number; cols: number; rows: number; w: number; h: number; gapX: number; gapY: number }): void;
  build(scene: THREE.Scene): void;                 // crée l'InstancedMesh une fois tous les bâtiments posés
  setTheme(palette: Palette): void;
  setActive(amounts: readonly number[]): void;     // une valeur 0 → 1 par parcelle
  tick(time: number): void;
  dispose(): void;
}
export function createWindows(palette: Palette): Windows;

// signs.ts
export type Tone = "violet" | "rouge" | "bleu" | "jaune";
export interface Signs {
  plate(parent: THREE.Object3D, text: string, at: { x: number; y: number; z: number; rotY: number; w: number; h: number; tone: Tone }): { setText(text: string): void };
  setTheme(theme: Theme): void;                    // redessine tous les panneaux
  dispose(): void;
}
export function createSigns(theme: Theme): Signs;

// screens.ts
export interface Screens {
  mount(lotIndex: number, parent: THREE.Object3D, at: { x: number; y: number; z: number; rotY: number }): void;
  load(lotIndex: number, urls: { small: string; large: string }, domain: string): void;
  anchor(lotIndex: number): THREE.Vector3;         // haut de l'écran, en coordonnées monde
  setTheme(palette: Palette): void;
  setActive(amounts: readonly number[]): void;
  dispose(): void;
}
export function createScreens(palette: Palette, signs: Signs): Screens;

// buildings/index.ts
export interface BuildContext {
  kit: Kit;
  windows: Windows;
  signs: Signs;
  screens: Screens;
  lotIndex: number;
  tone: Tone;
}
export type Builder = (ctx: BuildContext) => THREE.Group;   // groupe centré sur l'origine de la parcelle
export const builders: Record<StopId, Builder>;
```

- [ ] **Step 1 : fenêtres, enseignes, écrans**

`windows.ts` : un seul `InstancedMesh` de plans, `MeshBasicMaterial`, couleur par instance ; `setTheme`, `setActive(lotIndex, amount)`, `tick(time)` (quelques fenêtres changent d'état la nuit). `signs.ts` : texte dessiné dans un canvas 2D en Funnel Display après `document.fonts.load`, redessiné au changement de thème. `screens.ts` : cadre sombre à barre de navigateur (trois points, domaine), plan texturé par la capture, 6,4 × 4 ; `setActive` règle la luminosité ; la capture 1280 px remplace la 640 px quand l'arrêt est actif ou voisin.

- [ ] **Step 2 : les bâtiments, un par un**

Pour chacun : écrire le constructeur, le regarder dans `/lab?focus=<id>` sous deux angles et dans les deux thèmes, corriger. Recette (tableau de la spec) :

| `StopId` | Volumes | Signe distinctif |
|---|---|---|
| `qualitrack` | Tour 5 × 14 × 5, aile basse 6 × 4 × 5 | Coche lumineuse sur le toit |
| `dr-salti` | Deux cubes décalés, baie vitrée | Enseigne dent |
| `sasportas` | Plan en L, toit plat, auvent sur poteaux | Enseigne croix |
| `points-rambrouch` | Hall 9 × 4,5 × 6, deux portes sectionnelles | Pile de pneus, voiture sur pont |
| `thill-loehr` | Bâtiment technique bas, armoires | Mât d'antennes, parabole |
| `jour-de-rien` | Volume à fronton, marches | Marquise à ampoules, rideau rouge |
| `marque` | Bâtiment à quatre colonnes et fronton | Médaillon ® |
| `lbshop` | Boutique à vitrine | Store rayé, cartons empilés |
| `lbdigital-site` | Cube vitré | Écran de façade `</>` |
| `sc-conduite` | Petit bâtiment à auvent | Voiture-école à panneau de toit, plots |
| `portfolio` | Maisonnette à toit en pente | Drapeau GD, antenne |
| `lot` | Palissade, échafaudage | Grue, panneau « Votre projet ? » |

Critère d'acceptation : chaque bâtiment se reconnaît sans lire son enseigne, tient dans sa parcelle, et son écran est lisible depuis la pose de son arrêt.

- [ ] **Step 3 : assembler et vérifier**

Run: capture CDP de `/lab?p=0` (vue d'ensemble) et de `/lab?p=<stopProgress(i)>` pour i = 0, 5, 11, deux thèmes.
Expected: 12 parcelles occupées, aucun bâtiment n'en masque un autre à son arrêt, enseignes nettes.

- [ ] **Step 4 : commit**

```bash
git add src/city
git commit -m "feat(city): the twelve lots with windows, signs and screens"
```

---

### Task 5 : Vie de la scène et thèmes

**Files:**
- Create: `src/city/props.ts`
- Modify: `src/city/index.ts`, `src/city/palette.ts`

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: `CityHandle` complet (`setTheme` animé, `project`, arrêt actif éclairé).

- [ ] **Step 1 : décor** — arbres et lampadaires instanciés, halos au sol la nuit (sprites additifs), cinq voitures qui suivent les rues en boucle, balise (octaèdre + anneau) au-dessus de l'arrêt actif.
- [ ] **Step 2 : arrêt actif** — une valeur `0 → 1` par parcelle, amortie ; elle règle fenêtres, enseigne et écran. En vue d'ensemble : écrans à mi-luminosité ; au final : tout allumé.
- [ ] **Step 3 : jour / nuit** — `setTheme(theme, animate)` : couleurs des matériaux, lumières, fond, brouillard, fenêtres, halos ; interpolation de 0,7 s si `animate`, immédiate sinon, puis recalcul des ombres.
- [ ] **Step 4 : ancres** — `project("label:<StopId>")` renvoie la position écran du haut de l'écran géant de chaque parcelle (du panneau pour `lot`).
- [ ] **Step 5 : résolution adaptative** — moyenne des 40 premières images ; au-delà de 22 ms, rapport de pixels à 1.
- [ ] **Step 6 : vérifier**

Run: captures CDP de `/lab` : vue d'ensemble, trois arrêts, final, dans les deux thèmes.
Expected: nuit violette à fenêtres jaunes, jour lilas, arrêt actif nettement plus lumineux, voitures visibles, console sans erreur.

- [ ] **Step 7 : commit**

```bash
git add src/city
git commit -m "feat(city): day and night themes, traffic and active-stop lighting"
```

---

### Task 6 : Système visuel, scène, hero et visite

**Files:**
- Create: `src/components/city/CityContext.tsx`, `src/components/city/CityStage.tsx`, `src/components/sections/Journey.tsx`, `src/lib/scroll.ts`, `src/data/tour.ts`
- Modify: `src/styles/global.css`, `src/layouts/Layout.astro`, `src/components/Portfolio.tsx`, `src/components/Navbar.tsx`, `src/components/motion/SmoothScroll.tsx`, `src/data/projects.ts`, `src/i18n/translations.ts`

**Interfaces:**
- Consumes: `createCity`, `tourConfig`, `stopProgress`, `tourLength`, `STOP_IDS`.
- Produces:

```ts
// lib/scroll.ts
export function setLenis(instance: Lenis | null): void;
export function scrollToY(y: number): void;      // Lenis s'il tourne, sinon window.scrollTo

// data/tour.ts
export interface TourStop { id: StopId; project?: Project; }
export const tourStops: TourStop[];               // 11 projets puis { id: "lot" }

// components/city/CityContext.tsx
export type CityStatus = "loading" | "ready" | "off";
export function CityProvider(props: { children: React.ReactNode }): JSX.Element;
export function useCity(): { status: CityStatus; active: number; goToStop(index: number): void };
```

- [ ] **Step 1 : jetons, polices, composants de base** dans `global.css` et `Layout.astro` : couleurs des deux thèmes, `--font-display` / `--font-sans` / `--font-mono`, rayons `0.5 / 0.875 / 1.5 rem`, classe `.block` (filet, tranche de 5 px), boutons qui se soulèvent et s'enfoncent. Les règles des anciennes sections restent en place jusqu'à la tâche 7.

- [ ] **Step 2 : données** — `tone` sur les 11 projets (cycle violet, rouge, bleu, jaune), `data/tour.ts`, libellés FR/EN (accroche du hero, compteur, précédent, suivant, passer la visite, fiche du terrain, étiquette « Prochain : votre projet ? »).

- [ ] **Step 3 : `CityStage`** — canvas `position: fixed; inset: 0`, `aria-hidden`. Après hydratation : test WebGL, puis `import("../../city")` dans `requestIdleCallback`. Boucle :

```ts
const frame = () => {
  raf = requestAnimationFrame(frame);
  const journeyRect = journey.getBoundingClientRect();
  const contactRect = contact.getBoundingClientRect();
  const vh = window.innerHeight;
  const inJourney = journeyRect.bottom > 0;
  const inContact = contactRect.top < vh;

  // Rien à dessiner sous le rideau
  if (!inJourney && !inContact) return city.stop();
  city.start();

  if (inContact && !inJourney) {
    city.setView({ kind: "finale", progress: (vh - contactRect.top) / contactRect.height });
    return;
  }

  const pinned = journey.offsetHeight - pin.offsetHeight;
  const progress = -journeyRect.top / pinned; // tourState borne et assainit
  const state = tourState(progress, tourConfig);
  city.setView({ kind: "journey", progress });
  pin.style.setProperty("--hero", state.heroFade.toFixed(3));
  pin.style.setProperty("--tour", state.tourFade.toFixed(3));
  if (state.active !== activeRef.current) {
    activeRef.current = state.active;
    setActive(state.active); // rendu React seulement quand l'arrêt change
  }
  placeLabels();
};
```

Thème appliqué dans un `useLayoutEffect` (`city.setTheme(theme, false)` quand la bascule passe par View Transitions, pour que la scène soit à jour dans l'instantané). Langue : un effet appelle `city.setLotLabel(translations.tour.lot_sign[lang])`. Redimensionnement : un `ResizeObserver` sur le canvas appelle `city.resize()` et recalcule le cadrage. `goToStop(i)` : `scrollToY(journeyTop + stopProgress(i, tourConfig) × pinned)`.

- [ ] **Step 4 : `Journey`** — `<section id="journey">` de hauteur `calc(100svh × (1 + tourLength))`, bloc épinglé `position: sticky; top: 0; height: 100svh`. Dedans : texte du hero (opacité `--hero`), panneau de visite (opacité `--tour`) avec `<nav>` rail de 12 boutons (`aria-current`) et 12 `<article>` dont les inactifs sont `inert`, étiquettes projetées, indice de défilement, lien « Passer la visite ». Ancres `#top` au début et `#projects` à `heroSpan × 100svh`.

- [ ] **Step 5 : `Navbar`** flottante : monogramme, liens, FR/EN, thème (View Transitions conservé), contact, section active, progression.

- [ ] **Step 6 : vérifier**

Run: `npx astro check && npm test`, puis captures CDP de `/` à 1440 px : hero, arrêts 1, 6 et 12, deux thèmes.
Expected: le texte du hero s'efface pendant la plongée, la fiche suit l'arrêt, le bâtiment actif est éclairé.

Vérifications Review Focus :
- recharger la page à mi-visite (`scrollTo` puis `Page.reload`) → bon arrêt actif dès la première capture ;
- Tab depuis le haut de page → le focus passe par les boutons du rail et le lien de la fiche active, jamais par une fiche inactive ; Entrée sur le bouton 5 → `active === 4`.

- [ ] **Step 7 : commit**

```bash
git add src
git commit -m "feat(design): scroll-driven city hero and guided tour"
```

---

### Task 7 : Rideau — Stack, Parcours, À propos

**Files:**
- Modify: `src/components/sections/{Stack,Experience,About}.tsx`, `src/components/motion/Reveal.tsx`, `src/styles/global.css`

- [ ] **Step 1 : conteneur rideau** — fond opaque `--paper`, coins hauts arrondis, au-dessus du canvas.
- [ ] **Step 2 : Stack** — 4 groupes, une couleur par groupe ; chaque techno est un `.block` (logo, nom, usage) dont la descente est liée au défilement (`useScroll` sur le groupe, décalage par indice).
- [ ] **Step 3 : Parcours** — ligne verticale dont le remplissage suit le défilement (`scaleY`), une station par expérience, la plus récente en haut.
- [ ] **Step 4 : À propos** — portrait qui se dévoile et glisse, texte, quatre faits.
- [ ] **Step 5 : retirer** de `global.css` les règles des anciennes sections.
- [ ] **Step 6 : vérifier**

Run: `npx astro check`, captures CDP des trois sections à 1440 px, deux thèmes.
Expected: le rideau recouvre la ville, les blocs sont posés une fois la section traversée, contrastes lisibles.

- [ ] **Step 7 : commit**

```bash
git add src
git commit -m "feat(design): curtain sections for stack, experience and about"
```

---

### Task 8 : Contact et pied de page

**Files:**
- Modify: `src/components/sections/Contact.tsx`, `src/components/Portfolio.tsx`, `src/styles/global.css`

- [ ] **Step 1** — section transparente `min-height: 100svh`, bloc de contact (titre, phrase, e-mail en grand, « Écrire », « Copier », profils), pied de page. La logique de copie de l'adresse est reprise telle quelle.
- [ ] **Step 2** — cadrage du final (`setFraming`) : ville à droite du bloc sur ordinateur.
- [ ] **Step 3 : vérifier**

Run: captures CDP du bas de page, deux thèmes.
Expected: la ville réapparaît entièrement allumée, le bloc est lisible, le bouton « Copier » passe à « Adresse copiée ».

- [ ] **Step 4 : commit**

```bash
git add src
git commit -m "feat(design): city finale behind the contact section"
```

---

### Task 9 : Mobile et repli

**Files:**
- Modify: `src/styles/global.css`, `src/components/city/CityStage.tsx`, `src/components/sections/Journey.tsx`

- [ ] **Step 1 : sous 1024 px** — ville cadrée en haut (`setFraming(0, y)`), fiche active en bas avec compteur « 02 / 12 » et boutons précédent / suivant, rail en rangée de points. Menu de navigation sous 768 px.
- [ ] **Step 2 : repli** — `data-city="off"` sur `<html>` si WebGL manque, si `createCity` lève une erreur ou si le contexte est perdu sans être restauré. Sous `:is(:root:not(.js), :root[data-city="off"])` : section non épinglée, hero en flux normal, 11 fiches en liste avec leur capture (`<img loading="lazy">`), fiche du terrain en appel à contact.
- [ ] **Step 3 : vérifier**

Run: captures CDP à 820 et 390 px, deux thèmes ; puis Chrome lancé avec `--disable-gpu --disable-3d-apis` à 1440 et 390 px.
Expected: aucune barre de défilement horizontale (`document.documentElement.scrollWidth === innerWidth`, mesuré via CDP) ; sans WebGL, hero + liste complète, aucun rectangle noir, console sans erreur.

Vérifications Review Focus :
- changer la taille de la fenêtre de 1440 à 900 px en cours de visite (`Emulation.setDeviceMetricsOverride`) → même arrêt actif, canvas aux nouvelles dimensions, pas de débordement ;
- provoquer une perte de contexte (`WEBGL_lose_context.loseContext()`) → l'image de la ville reste visible, pas de rectangle noir ; `restoreContext()` → la scène revient.

- [ ] **Step 4 : commit**

```bash
git add src
git commit -m "feat(fallback): mobile layout and a static project list without WebGL"
```

---

### Task 10 : Images de la ville et méta sociales

**Files:**
- Create: `src/assets/city/poster-{dark,light}-{wide,tall}.webp`, `public/og.jpg`
- Modify: `src/components/city/CityStage.tsx`, `src/layouts/Layout.astro`, `src/styles/global.css`

- [ ] **Step 1** — capturer `/lab?p=0` en WebP via CDP : 1600 × 1000 et 780 × 1400, deux thèmes, au cadrage du hero.
- [ ] **Step 2** — les afficher en fond de la scène (choix par thème et par orientation en CSS), fondu croisé avec le canvas quand le statut passe à `ready`.
- [ ] **Step 3** — `public/og.jpg` 1200 × 630 (ville de nuit et nom) ; balises `og:image`, `og:url`, `twitter:card` dans `Layout.astro`.
- [ ] **Step 4 : vérifier**

Run: capture CDP 200 ms après la navigation, puis 3 s après.
Expected: l'image est là tout de suite, le canvas la remplace sans saut visible.

- [ ] **Step 5 : commit**

```bash
git add src/assets/city public/og.jpg src
git commit -m "feat(seo): city posters and social card"
```

---

### Task 11 : Contenu, nettoyage, README

**Files:**
- Modify: `src/data/projects.ts`, `src/i18n/translations.ts`, `README.md`, `package.json`
- Delete: `src/components/BrowserFrame.tsx`, `src/components/motion/Ticker.tsx`, `src/hooks/useReveal.ts`, `src/components/sections/Hero.tsx`, `src/components/sections/Projects.tsx`, `src/pages/lab.astro`

- [ ] **Step 1** — entrée « Ce portfolio » : description mise à jour et tag `Three.js` ; pied de page « Construit avec Astro, React, Three.js et Tailwind CSS ».
- [ ] **Step 2** — supprimer les fichiers listés, `npm uninstall @fontsource-variable/bricolage-grotesque`.
- [ ] **Step 3** — `README.md` : remplacer le texte du gabarit Astro par la présentation du projet (structure de `src/city/`, comment ajouter un projet, commandes).
- [ ] **Step 4 : vérifier**

Run: `npx astro check && npm test && npm run build`
Expected: 0 erreur, tests verts, build OK ; `grep -r "bricolage\|BrowserFrame\|Ticker" src` ne renvoie rien.

- [ ] **Step 5 : commit**

```bash
git add -A src README.md package.json package-lock.json
git commit -m "chore: drop the previous design's components and refresh the readme"
```

---

### Task 12 : Vérification finale

- [ ] **Step 1** — `npx astro check`, `npm test`, `npm run build` ; noter la taille de `dist/`.
- [ ] **Step 2** — sur `npm run preview` : captures CDP à 1440, 820 et 390 px, thèmes clair et sombre : hero, trois arrêts, rideau, contact.
- [ ] **Step 3** — requêtes réseau : aucune vers un domaine autre que celui de la page.
- [ ] **Step 4** — console : aucune erreur ni avertissement.
- [ ] **Step 5** — bascule FR/EN et clair/sombre en cours de visite : l'arrêt actif est conservé, le panneau du terrain change de langue, la scène change de thème.
- [ ] **Step 6** — mettre à jour le coffre Obsidian : note projet, `Maintenant.md`, journal du jour, entrée dans `Décisions.md`.
