import { describe, expect, it } from "vitest";
import {
  mixPose,
  progressOf,
  stopProgress,
  tourLength,
  tourState,
  type Pose,
  type TourConfig,
} from "./tour";

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

describe("mixPose", () => {
  const from = pose(0, 350, 20);
  const to = pose(10, 10, 40);

  it("rend la pose de départ à 0 et celle d'arrivée à 1", () => {
    near(mixPose(from, to, 0), from);
    const end = mixPose(from, to, 1);
    expect(end.target[0]).toBeCloseTo(10, 6);
    expect(end.distance).toBeCloseTo(40, 6);
    // 350° + 20° = 370°, soit le même angle que 10°
    expect(Math.cos(end.azimuth)).toBeCloseTo(Math.cos(to.azimuth), 6);
    expect(Math.sin(end.azimuth)).toBeCloseTo(Math.sin(to.azimuth), 6);
  });

  it("interpole la distance sans prise de hauteur", () => {
    expect(mixPose(from, to, 0.5).distance).toBeCloseTo(30, 6);
  });
});

describe("progressOf", () => {
  it("donne la part parcourue", () => {
    expect(progressOf(350, 700)).toBe(0.5);
  });

  it("borne le résultat à [0, 1]", () => {
    expect(progressOf(-40, 700)).toBe(0);
    expect(progressOf(900, 700)).toBe(1);
  });

  it("vaut 0 quand il n'y a rien à parcourir", () => {
    // Section pas plus haute que son bloc épinglé, pendant un redimensionnement
    expect(progressOf(120, 0)).toBe(0);
    expect(progressOf(0, 0)).toBe(0);
    expect(progressOf(-120, 0)).toBe(0);
    expect(progressOf(120, -50)).toBe(0);
  });

  it("vaut 0 pour une mesure qui n'est pas un nombre", () => {
    expect(progressOf(NaN, 700)).toBe(0);
    expect(progressOf(350, NaN)).toBe(0);
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
