// Régénère les images tirées de la scène 3D :
//   - les quatre images d'attente de la ville (src/assets/city/poster-*.webp) ;
//   - la carte de partage (public/og.jpg) ;
//   - la capture du portfolio lui-même (src/assets/projects/portfolio*.webp).
//
// À relancer dès que la ville change (bâtiment, couleur, cadrage), sinon l'image
// d'attente ne correspond plus à ce que le canvas dessine.
//
//   npm run dev                               (dans un autre terminal)
//   node scripts/city-posters.mjs [origine]   (par défaut http://localhost:4321)
//
// Pilote Chrome en mode headless par son protocole de débogage, sans dépendance.
// Chemin de Chrome : variable CHROME_PATH, sinon les emplacements habituels.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const origin = process.argv[2] ?? "http://localhost:4321";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 9333;

const chrome = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((candidate) => candidate && existsSync(candidate));

if (!chrome) {
  console.error("Chrome introuvable : indiquez son chemin dans la variable CHROME_PATH.");
  process.exit(1);
}

// Mêmes cadrages que CityStage : la ville à droite du texte sur grand écran, en
// haut sinon. Les formats sont plus carrés (large) et plus hauts (portrait) que
// les écrans courants : mise à la largeur de la fenêtre, l'image la couvre toujours.
const jobs = [
  { url: "/lab?p=0&theme=dark&fx=0.19", width: 1600, height: 1280, scheme: "dark", file: "src/assets/city/poster-dark-wide.webp" },
  { url: "/lab?p=0&theme=light&fx=0.19", width: 1600, height: 1280, scheme: "light", file: "src/assets/city/poster-light-wide.webp" },
  { url: "/lab?p=0&theme=dark&fy=0.17", width: 780, height: 1800, scheme: "dark", file: "src/assets/city/poster-dark-tall.webp" },
  { url: "/lab?p=0&theme=light&fy=0.17", width: 780, height: 1800, scheme: "light", file: "src/assets/city/poster-light-tall.webp" },
  { url: "/lab?p=0&theme=dark&og=1&fx=0.21", width: 1200, height: 630, scheme: "dark", file: "public/og.jpg", quality: 86 },
  { url: "/", width: 1280, height: 800, scheme: "dark", file: "src/assets/projects/portfolio.webp", quality: 82, wait: 9000 },
  { url: "/", width: 1280, height: 800, scheme: "dark", file: "src/assets/projects/portfolio-sm.webp", scale: 0.5, wait: 9000 },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = mkdtempSync(path.join(tmpdir(), "city-posters-"));
const browser = spawn(
  chrome,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--hide-scrollbars",
    "--enable-gpu",
    "--ignore-gpu-blocklist",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let failure = null;
try {
  let endpoint;
  for (let attempt = 0; attempt < 80 && !endpoint; attempt++) {
    try {
      endpoint = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl;
    } catch {
      await sleep(250);
    }
  }
  if (!endpoint) throw new Error("Chrome ne répond pas sur son port de débogage");

  const socket = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    const waiting = pending.get(message.id);
    if (!waiting) return;
    pending.delete(message.id);
    if (message.error) waiting.reject(new Error(message.error.message));
    else waiting.resolve(message.result);
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      pending.set(++id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params, sessionId }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  await page("Page.enable");

  for (const job of jobs) {
    await page("Emulation.setDeviceMetricsOverride", { width: job.width, height: job.height, deviceScaleFactor: 1, mobile: false });
    await page("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: job.scheme }] });
    await page("Page.navigate", { url: origin + job.url });
    // Le temps de charger Three.js, les captures des sites et les polices des enseignes
    await sleep(job.wait ?? 6500);
    // La barre d'outils d'Astro n'a rien à faire sur une capture
    await page("Runtime.evaluate", {
      expression: `document.head.appendChild(Object.assign(document.createElement("style"), { textContent: "astro-dev-toolbar { display: none !important }" }))`,
    });
    await sleep(200);

    const format = job.file.endsWith(".jpg") ? "jpeg" : "webp";
    const { data } = await page("Page.captureScreenshot", {
      format,
      quality: job.quality ?? 80,
      clip: { x: 0, y: 0, width: job.width, height: job.height, scale: job.scale ?? 1 },
    });
    const target = path.join(root, job.file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(data, "base64"));
    console.log(`${job.file}  ${Math.round(statSync(target).size / 1024)} Ko`);
  }

  await send("Browser.close").catch(() => {});
} catch (error) {
  failure = error;
} finally {
  // On laisse Chrome se fermer de lui-même (Browser.close) avant de forcer :
  // tué trop tôt, ses processus enfants gardent le profil verrouillé.
  await Promise.race([new Promise((resolve) => browser.once("exit", resolve)), sleep(5000)]);
  browser.kill();
  // Un dossier temporaire resté là ne vaut pas un échec
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 });
  } catch {
    console.warn(`Profil temporaire non supprimé : ${profile}`);
  }
}

if (failure) {
  console.error(`Échec : ${failure.message}\nLe serveur de développement tourne-t-il sur ${origin} ?`);
  process.exit(1);
}
