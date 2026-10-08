import { describe, expect, it } from "vitest";
import { CITY, LOTS, STOP_IDS, finalePose, tourConfig } from "./layout";
import { tourLength } from "./tour";

const degrees = (radians: number) => (radians * 180) / Math.PI;

describe("plan de la ville", () => {
  it("compte 12 arrêts, tous différents, le terrain en dernier", () => {
    expect(STOP_IDS).toHaveLength(12);
    expect(new Set(STOP_IDS).size).toBe(12);
    expect(STOP_IDS.at(-1)).toBe("lot");
  });

  it("commence par les trois projets phares", () => {
    expect(STOP_IDS.slice(0, 3)).toEqual(["qualitrack", "dr-salti", "sasportas"]);
  });

  it("place une parcelle par arrêt, dans le même ordre", () => {
    expect(LOTS.map((lot) => lot.id)).toEqual([...STOP_IDS]);
  });

  it("garde chaque parcelle sur le socle", () => {
    for (const lot of LOTS) {
      expect(Math.abs(lot.x) + CITY.lotW / 2).toBeLessThanOrEqual(CITY.width / 2);
      expect(Math.abs(lot.z) + CITY.lotD / 2).toBeLessThanOrEqual(CITY.depth / 2);
    }
  });

  it("n'empile aucune parcelle", () => {
    LOTS.forEach((a, i) => {
      for (const b of LOTS.slice(i + 1)) {
        const apart =
          Math.abs(a.x - b.x) >= CITY.lotW + CITY.road - 1e-9 ||
          Math.abs(a.z - b.z) >= CITY.lotD + CITY.road - 1e-9;
        expect(apart).toBe(true);
      }
    });
  });

  it("fait serpenter la visite : deux arrêts consécutifs sont voisins", () => {
    for (let i = 1; i < LOTS.length; i++) {
      const dx = Math.abs(LOTS[i].x - LOTS[i - 1].x);
      const dz = Math.abs(LOTS[i].z - LOTS[i - 1].z);
      const sideBySide = Math.abs(dx - (CITY.lotW + CITY.road)) < 1e-9 && dz < 1e-9;
      const backToFront = Math.abs(dz - (CITY.lotD + CITY.road)) < 1e-9 && dx < 1e-9;
      expect(sideBySide || backToFront).toBe(true);
    }
  });

  it("met la tour au fond et le terrain au premier plan", () => {
    const depths = LOTS.map((lot) => lot.z);
    expect(LOTS[0].z).toBe(Math.min(...depths));
    expect(LOTS[11].z).toBe(Math.max(...depths));
  });
});

describe("poses de la visite", () => {
  it("vise la parcelle de chaque arrêt", () => {
    expect(tourConfig.stops).toHaveLength(12);
    tourConfig.stops.forEach((stop, i) => {
      expect(stop.target[0]).toBeCloseTo(LOTS[i].x, 6);
      expect(stop.target[2]).toBeCloseTo(LOTS[i].z, 6);
    });
  });

  it("dure 7 hauteurs de fenêtre", () => {
    expect(tourLength(tourConfig)).toBeCloseTo(7);
  });

  it("regarde toujours la ville depuis le même quadrant, en plongée", () => {
    for (const pose of [tourConfig.overview, ...tourConfig.stops]) {
      expect(degrees(pose.azimuth)).toBeGreaterThanOrEqual(20);
      expect(degrees(pose.azimuth)).toBeLessThanOrEqual(70);
      expect(degrees(pose.elevation)).toBeGreaterThanOrEqual(20);
      expect(degrees(pose.elevation)).toBeLessThanOrEqual(50);
      expect(pose.distance).toBeGreaterThan(0);
    }
  });

  it("part de plus loin qu'elle n'arrive", () => {
    const farthestStop = Math.max(...tourConfig.stops.map((stop) => stop.distance));
    expect(tourConfig.overview.distance).toBeGreaterThan(farthestStop);
  });
});

describe("finalePose", () => {
  it("recule à mesure qu'on descend", () => {
    expect(finalePose(1).distance).toBeGreaterThan(finalePose(0).distance);
  });

  it("borne la progression et ignore une valeur qui n'est pas un nombre", () => {
    expect(finalePose(-2)).toEqual(finalePose(0));
    expect(finalePose(7)).toEqual(finalePose(1));
    expect(finalePose(NaN)).toEqual(finalePose(0));
  });
});
