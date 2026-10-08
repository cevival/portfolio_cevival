// Sous Windows, Smart App Control bloque certains binaires natifs non signés :
// le compilateur d'Astro (@astrojs/compiler-binding) et son moteur Markdown
// (satteri). Leurs équivalents WebAssembly fonctionnent, mais npm ne les installe
// jamais sur une machine x64 et les retire à chaque `npm install` — après quoi
// `astro dev`, `astro check` et `astro build` échouent avec
// « An Application Control policy has blocked this file ».
//
// Ce script, lancé en `postinstall`, remet en place le repli WebAssembly de
// chaque binaire natif qui refuse de se charger. Il ne fait rien ailleurs que
// sous Windows, ni quand les binaires natifs se chargent normalement.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.platform !== "win32") process.exit(0);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(root, "package-lock.json");
if (!existsSync(lockPath)) process.exit(0);

const require = createRequire(path.join(root, "package.json"));
const { packages } = JSON.parse(readFileSync(lockPath, "utf8"));
const WASI = "-wasm32-wasi";

const loads = (name) => {
  try {
    require(name);
    return true;
  } catch {
    return false;
  }
};

const missing = [];
for (const [location, meta] of Object.entries(packages)) {
  if (!location.endsWith(WASI)) continue;
  const fallback = location.slice(location.lastIndexOf("node_modules/") + 13);
  const native = `${fallback.slice(0, -WASI.length)}-win32-${process.arch}-msvc`;

  // Pas de variante native pour cette machine dans le verrou : rien à comparer
  if (!(`node_modules/${native}` in packages)) continue;
  if (loads(native)) continue;
  if (existsSync(path.join(root, "node_modules", fallback, "package.json"))) continue;

  missing.push(`${fallback}@${meta.version}`);
}

if (missing.length === 0) process.exit(0);

console.log(
  `Binaires natifs bloqués : installation du repli WebAssembly (${missing.join(", ")})`,
);

// --no-save : rien n'est écrit dans package.json ni dans le verrou.
// --force : ces paquets déclarent `cpu: wasm32`, npm les refuserait sur x64.
// --ignore-scripts : évite de relancer ce `postinstall` en boucle.
const args = ["install", "--no-save", "--force", "--ignore-scripts", "--no-audit", "--no-fund", ...missing];
const npmCli = process.env.npm_execpath;
const result = npmCli
  ? spawnSync(process.execPath, [npmCli, ...args], { cwd: root, stdio: "inherit" })
  : spawnSync("npm", args, { cwd: root, stdio: "inherit", shell: true });

if (result.status !== 0) {
  console.error(
    `Repli WebAssembly non installé. À lancer à la main :\n  npm ${args.join(" ")}`,
  );
}
// Un échec ici ne doit pas faire échouer `npm install`
process.exit(0);
