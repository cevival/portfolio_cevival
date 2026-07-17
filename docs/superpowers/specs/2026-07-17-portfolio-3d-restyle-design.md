# Refonte 3D + animations du portfolio — Design

**Date** : 2026-07-17
**Statut** : validé par Guillaume (niveau 3D « les deux », Motion + anime.js, tout le site)

## Objectif

Moderniser le style du portfolio (Astro 7 + React 19 + Tailwind 4) en ajoutant de la
profondeur 3D et des animations soignées, **sans changer la palette** (violet
`--primary` 262° + cyan `#06b6d4`, tokens HSL existants, dark/light préservés).
Aucun push : commits locaux uniquement.

## Dépendances ajoutées

- `motion` (motion.dev, ex-Framer Motion) — apparitions au scroll, stagger, micro-interactions
- `animejs` v4 — animation du nom lettre par lettre dans le hero
- `three` + `@react-three/fiber` + `@react-three/drei` — scène WebGL du hero

## Composants nouveaux

| Fichier | Rôle |
|---|---|
| `src/components/motion/Reveal.tsx` | Wrapper Motion `whileInView` (fade-up + stagger), prop `delay`, respecte `prefers-reduced-motion` |
| `src/components/motion/TiltCard.tsx` | Carte 3D CSS : perspective + rotateX/rotateY suivant la souris via springs Motion + reflet « glare », désactivé au toucher / reduced-motion |
| `src/components/three/HeroScene.tsx` | Canvas R3F : icosaèdre wireframe distordu violet + champ de particules cyan, rotation lente + parallaxe souris. Monté uniquement côté client (flag `mounted`), lazy-loaded |

## Modifications

- **Hero** : scène 3D en fond (les blobs actuels restent en fallback/complément), nom
  « Guillaume Desplan » animé lettre par lettre (anime.js), CTA/badges en Reveal
- **About / Skills / Projects / Experience / Contact** : headers et cartes en `Reveal`
  (stagger), cartes principales enveloppées de `TiltCard`
- **Navbar** : slide-down à l'arrivée, soulignement animé des liens
- **Button** : variant `default` aligné sur `--primary` (violet) au lieu du bleu,
  micro-interactions scale hover/active

## Contraintes

- `prefers-reduced-motion` : toutes les animations JS/3D se désactivent proprement
- La scène Three.js ne doit pas casser le SSR Astro (`client:load` sur Portfolio) →
  montage après hydratation uniquement
- Mobile : tilt désactivé, scène 3D allégée (DPR plafonné)
- Build `astro build` doit passer

## Vérification

`npm run build` vert + inspection visuelle en dev (light/dark, FR/EN, mobile).
