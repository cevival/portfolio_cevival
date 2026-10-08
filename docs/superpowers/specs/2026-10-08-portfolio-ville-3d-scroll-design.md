# Refonte « ville 3D pilotée au scroll » — Design

**Date** : 2026-10-08
**Statut** : design validé en conversation par Guillaume (direction « Ville 3D au scroll », les 11 projets en arrêts de visite). Spec à relire avant le plan.
**Remplace** : la refonte du 2026-10-04 (thème clair, grille à filets, fenêtres de navigateur).

## Objectif

Refaire tout le style du portfolio autour d'une idée : **chaque site livré est un bâtiment d'une petite ville**, et faire défiler la page fait voyager une caméra de l'un à l'autre.

Ce que Guillaume a demandé :

- refaire le style complet ;
- garder les teintes violettes du thème sombre ;
- de l'animation au scroll (référence : la visite épinglée de `ai-portfolio-pierre-michel.vercel.app`) ou un rendu 3D (références : `itomdev.com`, `bruno-simon.com`).

La direction retenue réunit les deux : de la vraie 3D, pilotée par le scroll.

À quoi on reconnaît que c'est réussi :

- un visiteur comprend en dix secondes qui est Guillaume et voit ses vrais sites sans rien apprendre à manipuler (il suffit de défiler) ;
- la page reste lisible, référencée et utilisable au clavier, sur mobile et sans WebGL ;
- la scène tourne correctement sur un GPU intégré (Intel UHD, la machine de Guillaume).

## Décisions

| # | Décision | Pourquoi |
|---|---|---|
| 1 | Three.js seul, dans un module `src/city/` sans dépendance React, chargé en différé | Bundle plus léger que React Three Fiber, boucle de rendu maîtrisée, moteur isolé derrière une petite interface |
| 2 | Un seul canvas fixe derrière la page ; les sections du milieu sont opaques et passent dessus comme un rideau | Un seul contexte WebGL, la ville sert au hero, à la visite et au final ; rien à dessiner quand elle est masquée |
| 3 | Ville procédurale : aucun modèle 3D importé, tout est assemblé à partir de primitives | Poids minimal, palette entièrement maîtrisée, changement jour/nuit trivial |
| 4 | Le calcul « progression du scroll → pose de caméra + arrêt actif » est une fonction pure | C'est la seule logique non visuelle ; elle se teste sans navigateur |
| 5 | Les textes des projets restent du HTML rendu côté serveur | Référencement, lecteurs d'écran, clavier, repli sans WebGL |
| 6 | Thème sombre = nuit, thème clair = jour ; les jetons de couleur du thème sombre ne changent pas | Demande explicite de Guillaume |
| 7 | Les animations restent actives même si le système demande de les réduire | Choix de Guillaume du 2026-07-17 : les effets Windows sont coupés sur sa machine, il ne verrait plus rien. Le mouvement principal est de toute façon déclenché par le scroll de l'utilisateur |
| 8 | Zéro requête tierce, polices auto-hébergées | Acquis du 2026-10-04, conservé |

Approches écartées : React Three Fiber (deux dépendances de plus pour une scène pilotée par un seul nombre), séquence d'images pré-rendues (lourde, figée, pas de jour/nuit).

## Déroulé de la page

```
┌ nav flottante (fixe) ───────────────────────────────┐
│ #top      Hero ─┐                                    │
│ #projects Visite┴ une seule section haute, épinglée  │  transparent : on voit la ville
├──────────────────────────────────────────────────────┤
│ #stack      Stack                                    │
│ #experience Parcours                                 │  « rideau » opaque
│ #about      À propos                                 │
├──────────────────────────────────────────────────────┤
│ #contact  Contact + pied de page                     │  transparent : la ville revient
└──────────────────────────────────────────────────────┘
        canvas WebGL fixe, plein écran, derrière tout
```

### Hero

- À gauche : pastille de disponibilité, nom en très grand, intitulé, accroche (« Chaque site que j'ai livré est un bâtiment de cette ville. Faites défiler pour la visiter. »), deux boutons, liens GitHub / LinkedIn / e-mail.
- À droite : la ville vue de haut, vivante (fenêtres qui s'allument, voitures).
- Étiquettes HTML accrochées à trois bâtiments (les projets phares) et au terrain en chantier (« Prochain : votre projet ? »).
- Indice de défilement en bas.

### Visite

Une section haute contient un bloc épinglé de la hauteur de la fenêtre. La distance de défilement épinglée vaut **7 hauteurs de fenêtre** : 1 pour passer de la vue d'ensemble au premier arrêt, 0,5 entre deux arrêts consécutifs (11 trajets), 0,5 de pause sur le dernier.

- 12 arrêts : les 11 projets dans l'ordre actuel (3 phares puis 8 autres), puis le terrain « Votre projet ? ».
- À chaque arrêt la caméra se pose (elle ne bouge pas pendant 20 % du trajet de part et d'autre), puis repart en prenant un peu de hauteur.
- À gauche : un rail des 12 arrêts (numéro + nom, cliquables) et la fiche de l'arrêt actif : type, titre, description, tags, lien vers le site (et « Code source » pour le portfolio). La fiche du terrain porte l'appel à contact.
- Le bâtiment actif s'allume : fenêtres, enseigne, écran géant affichant la vraie capture du site, balise au-dessus du toit.
- Lien « Passer la visite » vers `#stack`.
- Le texte du hero s'efface pendant la plongée ; le rail et la fiche apparaissent à l'arrivée sur le premier arrêt.

### Stack, Parcours, À propos (rideau)

Bloc opaque à coins hauts arrondis qui recouvre la ville en montant.

- **Stack** : les 26 technos en 4 groupes. Chaque techno est un bloc (logo, nom, projet d'usage) qui se pose à sa place au fil du défilement ; chaque groupe a sa couleur.
- **Parcours** : une ligne de tram verticale qui se trace avec le défilement ; les trois expériences sont ses stations, la plus récente en haut.
- **À propos** : portrait, deux paragraphes, quatre faits. Le portrait se dévoile et glisse légèrement au défilement.

### Contact (final)

Le rideau se termine, la ville réapparaît sous un autre angle ; la caméra recule doucement à mesure qu'on descend. Un bloc porte le titre, la phrase, l'adresse e-mail en grand, les boutons « Écrire » et « Copier », les profils. Pied de page en dessous.

### Navigation

Barre flottante arrondie : monogramme GD et nom, liens (Projets, Stack, Parcours, À propos), bascule FR/EN, bascule de thème, bouton contact. Indicateur de section active et barre de progression. Menu déroulant sous 768 px.

## La ville

### Plan

Un socle rectangulaire épais (une maquette posée sur la page) découpé en **12 parcelles, 4 colonnes × 3 rangées**, séparées par des rues. L'ordre de visite serpente : rangée du fond de gauche à droite, rangée du milieu de droite à gauche, rangée de devant de gauche à droite. Deux arrêts consécutifs sont donc toujours voisins. La tour, plus haute, est au fond ; le terrain en chantier est au premier plan.

| # | Projet (`slug`) | Bâtiment | Signe distinctif | Couleur |
|---|---|---|---|---|
| 1 | `qualitrack` | Tour de bureaux et aile basse | Coche lumineuse sur le toit | violet |
| 2 | `dr-salti` | Cabinet moderne en deux volumes | Enseigne dent | rouge |
| 3 | `sasportas` | Cabinet en L, toit plat, auvent | Enseigne croix | bleu |
| 4 | `points-rambrouch` | Garage à deux portes sectionnelles | Pile de pneus, voiture sur pont | jaune |
| 5 | `thill-loehr` | Station technique | Mât d'antennes et parabole | violet |
| 6 | `jour-de-rien` | Théâtre à fronton | Marquise à ampoules | rouge |
| 7 | `marque` | Bâtiment à colonnes | Médaillon ® | bleu |
| 8 | `lbshop` | Boutique | Store rayé, cartons | jaune |
| 9 | `lbdigital-site` | Studio vitré | Écran de façade `</>` | violet |
| 10 | `sc-conduite` | Auto-école | Voiture-école, plots | rouge |
| 11 | `portfolio` | Maisonnette-atelier | Drapeau GD | bleu |
| 12 | — (terrain) | Chantier | Grue, palissade, panneau « Votre projet ? » | jaune |

Chaque bâtiment porte son nom sur une enseigne (texture dessinée dans un canvas 2D). Décor : arbres, lampadaires, quelques voitures qui suivent les rues.

### Rendu

- Caméra perspective à focale longue (champ de 26°), en plongée : l'aspect d'une illustration isométrique, avec un vrai effet de profondeur quand elle se déplace. L'angle change d'un arrêt à l'autre.
- Matériaux à facettes, sans texture, un matériau partagé par **rôle** de couleur (mur, toit violet, route, feuillage…). Changer de thème revient à changer la couleur d'une vingtaine de matériaux.
- Une lumière d'ambiance et une lumière directionnelle. Ombres portées calculées une seule fois (la scène est statique) et recalculées au changement de thème.
- Fond et brouillard de la couleur exacte de la page : les bords de la scène se fondent dans le papier, sans cadre visible.
- Fenêtres : un seul maillage instancié, sans éclairage. La nuit, une partie est allumée en jaune chaud et quelques-unes clignotent ; le bâtiment actif les allume toutes.
- Écrans géants : un plan par projet, texturé avec la capture existante (640 px d'abord, 1280 px quand la caméra approche), orienté vers la position de la caméra à cet arrêt.
- Pas de post-traitement.

### Jour et nuit

| | Nuit (sombre) | Jour (clair) |
|---|---|---|
| Page et fond de scène | `#0f0d1a` | `#f8f6ff` |
| Socle | `#171427` | `#efebff` |
| Murs | dégradé de violets (`#2a2642` → `#4a4570`) | blancs et lilas |
| Accents | `#7a62ff`, `#ff6a55`, `#f7df1e`, `#5b9be0` | `#5a3ee6`, `#f4442e`, `#f7df1e`, `#3178c6` |
| Fenêtres | jaune chaud allumé / violet éteint | vitrage bleuté |
| Lampadaires | halo au sol | éteints |

La bascule de thème garde l'ouverture en cercle depuis le bouton (View Transitions) : la scène change d'un coup à l'intérieur du cercle. Sans View Transitions, les couleurs de la scène glissent en 0,7 s.

## Style des sections HTML

### Couleurs

Thème sombre : jetons actuels **inchangés** (`--paper #0f0d1a`, `--surface #171427`, `--ink #f3f1fb`, `--muted #a7a3c0`, `--rule #2a2642`, `--violet #7a62ff`, `--accent #a596ff`, `--accent-solid #6a4df5`, teintes associées).

Thème clair : papier lilas `#f8f6ff`, surface `#efebff`, filets `#dcd7f0` ; encre `#16132a`, texte secondaire `#5d5a72`, violet `#5a3ee6` conservés.

### Typographie

Comparée sur rendu réel (huit candidates, deux thèmes) :

- **Funnel Display** pour les titres : géométrique et large, à l'opposé du Bricolage condensé d'avant, lisible dans les deux thèmes ;
- **Funnel Sans** pour le texte : même famille ;
- **JetBrains Mono** conservée pour les numéros, dates, URL et tags.

Toutes en variable, auto-hébergées (`@fontsource-variable`). Bricolage Grotesque est retirée.

### Formes

- Coins arrondis (0,5 / 0,875 / 1,5 rem) à la place des angles droits.
- Le « bloc » : surface pleine, filet d'un pixel, tranche inférieure de 5 px plus sombre, comme un volume vu de face. Boutons, cartes de techno et fiches en sont. Un bouton se soulève au survol et s'enfonce au clic.
- Plus de grille à filets, de rails verticaux ni d'ombres dures décalées.

### Animations au défilement

- Hero et visite : liées à la progression du scroll, image par image.
- Rideau : titres qui se dévoilent mot à mot, blocs de la stack qui se posent en cascade, ligne du parcours qui se trace, portrait qui glisse.
- Défilement inertiel Lenis conservé.

## Architecture

```
src/
  city/                      moteur 3D — TypeScript pur, aucune dépendance React
    index.ts                 createCity(options) → CityHandle
    tour.ts                  logique pure : progression → pose + arrêt actif   (testée)
    tour.test.ts
    layout.ts                plan : parcelles, rues, pose de caméra de chaque arrêt
    palette.ts               couleurs jour / nuit par rôle
    kit.ts                   primitives low-poly + matériaux partagés par rôle
    ground.ts                socle, grille, rues
    props.ts                 arbres, lampadaires, voitures
    windows.ts               fenêtres instanciées
    screens.ts               écrans géants
    signs.ts                 enseignes (canvas 2D → texture)
    buildings/               un fichier par bâtiment : (kit) => Group
  components/
    Portfolio.tsx            racine de l'îlot
    Navbar.tsx
    Logo.tsx                 inchangé
    city/CityStage.tsx       canvas fixe, image d'attente, chargement différé, boucle de scroll
    city/CityContext.tsx     arrêt actif, état « prêt », repli
    sections/Journey.tsx     hero + visite (HTML)
    sections/Stack.tsx  Experience.tsx  About.tsx  Contact.tsx
    motion/Reveal.tsx        apparitions au défilement
    motion/SmoothScroll.tsx  Lenis
  lib/scroll.ts              scrollToY(y) : passe par Lenis s'il tourne
  data/projects.ts           + couleur (`tone`) sur les 11 projets
  data/tour.ts               liste ordonnée des 12 arrêts
```

Supprimés : `BrowserFrame.tsx`, `motion/Ticker.tsx`, `hooks/useReveal.ts`, les fenêtres déplaçables et le nom à police variable du hero.

### Interface du moteur

```ts
interface CityOptions {
  canvas: HTMLCanvasElement;
  theme: "light" | "dark";
  stops: { id: string; title: string; screen?: { small: string; large: string } }[];
  lotLabel: string;                       // « Votre projet ? » / « Your project? »
}

type CityView =
  | { kind: "journey"; progress: number } // 0 → 1 sur la section épinglée
  | { kind: "finale"; progress: number }; // 0 → 1 sur la section contact

interface CityHandle {
  setView(view: CityView): void;
  setTheme(theme: "light" | "dark", animate: boolean): void;
  setFraming(x: number, y: number): void; // décale le sujet dans le cadre selon la mise en page
  setLotLabel(label: string): void;
  project(anchorId: string): { x: number; y: number; visible: boolean } | null;
  resize(): void;
  start(): void;                          // boucle de rendu
  stop(): void;                           // pause (section masquée, onglet caché)
  dispose(): void;
}
```

`tour.ts` exporte `tourState(progress, config)` → `{ pose, active, heroFade, tourFade }` et `stopProgress(index, config)` (la progression à laquelle un arrêt est centré, pour les clics sur le rail). `active` vaut −1 pendant le hero.

### Qui fait quoi à chaque image

`CityStage` tient une seule boucle `requestAnimationFrame`, active seulement quand une section transparente est à l'écran :

1. mesure la section visite et la section contact ;
2. en déduit la vue et appelle `city.setView` ;
3. écrit `--hero` et `--tour` (opacités du texte du hero et du panneau de visite) en propriétés CSS sur le bloc épinglé — aucun rendu React ;
4. met à jour l'état React `active` **uniquement quand l'arrêt change** ;
5. place les étiquettes avec `city.project`.

### Chargement et repli

1. Le HTML servi contient le hero, le rail et les 12 fiches.
2. Une image de la ville pré-rendue (deux thèmes, format large et format portrait) s'affiche tout de suite derrière le hero.
3. Après hydratation, `CityStage` vérifie WebGL, puis importe `src/city/` quand le navigateur est disponible. À la première image dessinée, le canvas apparaît en fondu par-dessus l'image.
4. Sans WebGL ou si l'initialisation échoue : `data-city="off"` sur `<html>`. L'image reste en fond du hero, la section n'est plus épinglée, les 11 projets s'affichent en liste classique avec leurs captures. Même mise en page sans JavaScript.

### Mobile

- Sous 1024 px : la ville est cadrée dans la moitié haute, la fiche active occupe le bas avec un compteur « 02 / 12 » et deux boutons précédent / suivant ; le rail devient une rangée de points.
- Le défilement tactile reste natif.
- Résolution du canvas plafonnée comme sur ordinateur.

### Performance

- Rapport de pixels plafonné à 1,5 ; s'il faut plus de 22 ms par image en moyenne sur les 40 premières, il passe à 1.
- Aucune image dessinée quand la ville est masquée par le rideau ou que l'onglet est caché.
- Three.js dans un fragment à part, hors du chargement initial.

### Accessibilité et référencement

- `<canvas aria-hidden="true">` ; les étiquettes accrochées aux bâtiments sont décoratives.
- Le rail est une liste de boutons (`aria-current` sur l'arrêt actif) ; un clic ou Entrée fait défiler jusqu'à l'arrêt. Les fiches inactives sont `inert`.
- Contrastes AA sur les deux thèmes, focus visible partout.
- Balises `og:image` et `twitter:card` ajoutées avec l'image de la ville.
- `<html lang>` continue de suivre la langue.

## Contenu

Inchangé, sauf :

- nouveaux libellés FR/EN : accroche du hero, textes de la visite (compteur, précédent, suivant, passer la visite, fiche du terrain), intitulés de section ;
- entrée « Ce portfolio » : description mise à jour et tag `Three.js` ;
- pied de page : « Construit avec Astro, React, Three.js et Tailwind CSS ».

Three.js n'est **pas** ajouté à la section Stack, qui annonce les technologies utilisées au quotidien.

## Dépendances

- Ajoutées : `three`, `@fontsource-variable/funnel-display`, `@fontsource-variable/funnel-sans` ; en développement `@types/three`, `vitest`.
- Retirée : `@fontsource-variable/bricolage-grotesque`.
- Conservées : `motion`, `lenis`, `lucide-react`, `@fontsource-variable/jetbrains-mono`.

## Hors périmètre

- Pas de jeu, de physique, de son, ni de véhicule à conduire.
- Pas de nouvelle page ni d'étude de cas par projet.
- Pas de changement de domaine ; **rien n'est poussé ni déployé sans l'accord de Guillaume**.
- Les fichiers du gabarit Astro non utilisés (`Welcome.astro`, `astro.svg`, `background.svg`) ne sont pas touchés.

## Vérification

- `npx astro check` : 0 erreur ; `npm run build` : OK.
- `npm test` : tests Vitest de `tour.ts` — bornes (0 et 1), arrêt actif à chaque palier, caméra immobile pendant les pauses, continuité de la pose entre deux trajets, `stopProgress` cohérent avec `tourState`. Étape ajoutée à la CI.
- Captures Chrome headless (CDP) à 1440, 820 et 390 px, thèmes clair et sombre : hero, trois arrêts, rideau, contact.
- Aucun débordement horizontal aux trois largeurs (mesuré via CDP, pas via `--window-size`).
- Aucune requête vers un domaine tiers au chargement.
- Repli vérifié en désactivant WebGL (`--disable-gpu --disable-3d-apis`).
- Console sans erreur.

## Risques

| Risque | Parade |
|---|---|
| Des bâtiments faits de primitives peuvent paraître pauvres | Itérations sur captures réelles, bâtiment par bâtiment ; signes distinctifs, enseignes et éclairage soignés |
| Fluidité sur GPU intégré | Scène légère, ombres figées, pas de post-traitement, résolution adaptative |
| Visite longue (7 écrans) | Rail cliquable, lien « Passer la visite », pauses courtes |
| Décalage entre l'image d'attente et le canvas | Fondu croisé ; images générées depuis la scène elle-même, au même cadrage |
