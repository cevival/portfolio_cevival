# Guillaume Desplan — Portfolio

Portfolio personnel one-page, en ligne sur [guillaume-desplan.vercel.app](https://guillaume-desplan.vercel.app).

Chaque site livré y est un bâtiment d'une petite ville en 3D. Faire défiler la page fait voyager la caméra d'un bâtiment à l'autre ; au-dessus de chacun, un écran affiche la vraie capture du site. Le thème sombre est la nuit de la ville, le thème clair son jour.

## Stack

- **Astro 7**, un seul îlot **React 19**
- **Three.js** pour la ville, chargé en différé ; aucun modèle 3D importé, tout est assemblé en code
- **Tailwind CSS 4**, jetons de couleur dans `src/styles/global.css`
- **Motion** et **Lenis** pour les animations liées au défilement
- Polices auto-hébergées (Funnel Display, Funnel Sans, JetBrains Mono) : aucune requête tierce
- **Vitest** pour la logique de la visite

## Commandes

| Commande | Action |
| :-- | :-- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Serveur de développement sur `localhost:4321` |
| `npm run check` | Vérification des types (`astro check`) |
| `npm test` | Tests unitaires |
| `npm run build` | Construit le site dans `dist/` |
| `npm run preview` | Sert le site construit |

## Structure

```text
src/
├── city/                  Moteur 3D : TypeScript pur, sans React
│   ├── index.ts           createCity() : assemble la scène, tient la boucle de rendu
│   ├── tour.ts            Progression du défilement → pose de caméra et arrêt actif (testé)
│   ├── layout.ts          Plan de la ville, point de vue de chaque arrêt (testé)
│   ├── palette.ts         Couleurs de jour et de nuit
│   ├── kit.ts             Primitives low-poly, un matériau par rôle de couleur
│   ├── buildings/         Un fichier par bâtiment
│   └── …                  Sol, fenêtres, enseignes, écrans, lampadaires, voitures
├── components/
│   ├── city/              Canvas fixe et boucle qui relie le défilement à la scène
│   └── sections/          Journey (hero + visite), Stack, Experience, About, Contact
├── data/                  Projets, stack, arrêts de la visite
├── i18n/                  Textes français et anglais
└── lab/                   Page de labo de la ville, servie seulement en développement
```

## Comment la visite fonctionne

La section du haut est très haute, et son contenu reste épinglé à l'écran. `CityStage` mesure à chaque image où en est le défilement dans cette section, et `tour.ts` en déduit la pose de la caméra, l'arrêt actif et les fondus. Les textes des projets sont du HTML ordinaire : sans WebGL ou sans JavaScript, la page affiche le hero puis la liste des projets avec leurs captures.

## Ajouter un projet

La ville compte douze parcelles, quatre colonnes sur trois rangées : onze projets et un terrain à bâtir.

1. Ajouter l'entrée dans `src/data/projects.ts` et ses deux captures dans `src/assets/projects/` (`<slug>.webp` en 1280 px, `<slug>-sm.webp` en 640 px).
2. Ajouter son identifiant à `STOP_IDS` et son point de vue à `VIEWS` dans `src/city/layout.ts`. Si la grille est pleine, augmenter `COLS` ou `ROWS`.
3. Écrire son bâtiment dans `src/city/buildings/` et l'enregistrer dans `buildings/index.ts`.
4. Regarder le résultat sur la page de labo (`npm run dev`, puis `/lab?focus=<slug>&lit=1`), adapter les tests de `layout.test.ts`, puis régénérer les images.

## Régénérer les images de la ville

Les images d'attente affichées avant le chargement de la scène, la carte de partage et la capture du portfolio sont tirées de la scène elle-même. À refaire dès que la ville change :

```sh
npm run dev                      # dans un premier terminal
node scripts/city-posters.mjs    # dans un second
```

Le script pilote Chrome en mode headless. Si Chrome n'est pas à son emplacement habituel, indiquer son chemin dans la variable `CHROME_PATH`.

## Sous Windows

Smart App Control bloque le binaire natif du compilateur d'Astro, qui n'est pas signé. `scripts/ensure-wasm-fallback.mjs` installe alors sa version WebAssembly ; il est lancé après `npm install` et avant `dev`, `build` et `check`. Rien à faire à la main.

## Déploiement

Un push sur `main` lance la CI GitHub Actions (types, tests, build) puis le déploiement sur Vercel.
