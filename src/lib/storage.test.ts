import { afterEach, describe, expect, it, vi } from "vitest";
import { readPreference, writePreference } from "./storage";

// Ce que fait un navigateur dont les cookies sont bloqués
const refuse = () => {
  throw new DOMException("The operation is insecure.", "SecurityError");
};

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("readPreference", () => {
  it("rend la valeur enregistrée, ou null si elle manque", () => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => (key === "portfolio-theme" ? "dark" : null),
    });
    expect(readPreference("portfolio-theme")).toBe("dark");
    expect(readPreference("portfolio-lang")).toBeNull();
  });

  it("rend null quand le stockage refuse la lecture", () => {
    vi.stubGlobal("localStorage", { getItem: refuse });
    expect(readPreference("portfolio-theme")).toBeNull();
  });

  it("rend null quand le navigateur refuse jusqu'à l'accès au stockage", () => {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get: refuse });
    expect(readPreference("portfolio-theme")).toBeNull();
  });
});

describe("writePreference", () => {
  it("enregistre la valeur", () => {
    const stored = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      setItem: (key: string, value: string) => stored.set(key, value),
    });
    writePreference("portfolio-lang", "en");
    expect(stored.get("portfolio-lang")).toBe("en");
  });

  it("ne lève pas quand le stockage refuse l'écriture", () => {
    vi.stubGlobal("localStorage", { setItem: refuse });
    expect(() => writePreference("portfolio-lang", "en")).not.toThrow();
  });

  it("ne lève pas quand le navigateur refuse jusqu'à l'accès au stockage", () => {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, get: refuse });
    expect(() => writePreference("portfolio-lang", "en")).not.toThrow();
  });
});
