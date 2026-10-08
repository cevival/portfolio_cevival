import { defineConfig } from "vitest/config";

// Tests de logique pure uniquement : pas besoin de la configuration Astro.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
