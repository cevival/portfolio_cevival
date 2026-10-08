// Kit de construction low-poly : quelques primitives posées sur leur base, et
// un matériau partagé par rôle de couleur. Aucun modèle 3D n'est importé.
import {
  BoxGeometry,
  BufferGeometry,
  Color,
  CylinderGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Mesh,
  MeshLambertMaterial,
  type Object3D,
} from "three";
import { palettes, type Role, type Theme } from "./palette";

export interface Kit {
  material(role: Role): MeshLambertMaterial;
  /** Pavé de `w × h × d`, posé à la hauteur `y` et centré en `x, z` */
  box(parent: Object3D, role: Role, w: number, h: number, d: number, x: number, y: number, z: number): Mesh;
  /** Cylindre ou tronc de cône à `sides` pans */
  cyl(parent: Object3D, role: Role, rTop: number, rBottom: number, h: number, x: number, y: number, z: number, sides?: number): Mesh;
  cone(parent: Object3D, role: Role, r: number, h: number, x: number, y: number, z: number, sides?: number): Mesh;
  /** Toit à deux pans, faîtage le long de z */
  prism(parent: Object3D, role: Role, w: number, h: number, d: number, x: number, y: number, z: number): Mesh;
  /** Toit à quatre pans */
  pyramid(parent: Object3D, role: Role, w: number, h: number, d: number, x: number, y: number, z: number): Mesh;
  /** Boule à facettes (feuillage, ampoule) */
  blob(parent: Object3D, role: Role, r: number, x: number, y: number, z: number): Mesh;
  /** Recolore tous les matériaux entre deux thèmes, `mix` allant de 0 à 1 */
  setTheme(from: Theme, to: Theme, mix: number): void;
  dispose(): void;
}

// Prisme triangulaire unitaire, centré, faîtage le long de z
function prismGeometry() {
  const A = [-0.5, -0.5, -0.5];
  const B = [0.5, -0.5, -0.5];
  const C = [0.5, -0.5, 0.5];
  const D = [-0.5, -0.5, 0.5];
  const E = [0, 0.5, -0.5];
  const F = [0, 0.5, 0.5];
  const triangles = [
    [A, D, F], [A, F, E], // pan gauche
    [B, E, F], [B, F, C], // pan droit
    [D, C, F], // pignon avant
    [B, A, E], // pignon arrière
    [A, B, C], [A, C, D], // dessous
  ];
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(triangles.flat(2), 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function createKit(theme: Theme): Kit {
  let current = theme;
  const materials = new Map<Role, MeshLambertMaterial>();
  const geometries = new Map<string, BufferGeometry>();

  const material = (role: Role) => {
    let found = materials.get(role);
    if (!found) {
      found = new MeshLambertMaterial({ color: palettes[current].roles[role], flatShading: true });
      materials.set(role, found);
    }
    return found;
  };

  // Les géométries sont unitaires et partagées : la taille vient de l'échelle du maillage
  const shared = (key: string, make: () => BufferGeometry) => {
    let found = geometries.get(key);
    if (!found) {
      found = make();
      geometries.set(key, found);
    }
    return found;
  };

  const add = (
    parent: Object3D,
    geometry: BufferGeometry,
    role: Role,
    sx: number,
    sy: number,
    sz: number,
    x: number,
    y: number,
    z: number,
  ) => {
    const mesh = new Mesh(geometry, material(role));
    mesh.scale.set(sx, sy, sz);
    mesh.position.set(x, y + sy / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const cyl: Kit["cyl"] = (parent, role, rTop, rBottom, h, x, y, z, sides = 10) => {
    const widest = Math.max(rTop, rBottom);
    const top = rTop / widest;
    const bottom = rBottom / widest;
    const geometry = shared(
      `tube:${top.toFixed(3)}:${bottom.toFixed(3)}:${sides}`,
      () => new CylinderGeometry(top, bottom, 1, sides),
    );
    return add(parent, geometry, role, widest, h, widest, x, y, z);
  };

  const a = new Color();
  const b = new Color();

  return {
    material,
    box: (parent, role, w, h, d, x, y, z) =>
      add(parent, shared("box", () => new BoxGeometry(1, 1, 1)), role, w, h, d, x, y, z),
    cyl,
    cone: (parent, role, r, h, x, y, z, sides = 8) => cyl(parent, role, 0, r, h, x, y, z, sides),
    prism: (parent, role, w, h, d, x, y, z) =>
      add(parent, shared("prism", prismGeometry), role, w, h, d, x, y, z),
    pyramid: (parent, role, w, h, d, x, y, z) =>
      add(
        parent,
        // Un cône à quatre pans tourné d'un huitième de tour : sa base est un carré de côté 1
        shared("pyramid", () => new CylinderGeometry(0, Math.SQRT1_2, 1, 4).rotateY(Math.PI / 4)),
        role,
        w,
        h,
        d,
        x,
        y,
        z,
      ),
    blob: (parent, role, r, x, y, z) =>
      add(parent, shared("blob", () => new IcosahedronGeometry(0.5, 1)), role, r * 2, r * 2, r * 2, x, y, z),
    setTheme(from, to, mix) {
      for (const [role, mat] of materials) {
        a.setHex(palettes[from].roles[role]);
        b.setHex(palettes[to].roles[role]);
        mat.color.lerpColors(a, b, mix);
      }
      if (mix >= 1) current = to;
    },
    dispose() {
      for (const geometry of geometries.values()) geometry.dispose();
      for (const mat of materials.values()) mat.dispose();
      geometries.clear();
      materials.clear();
    },
  };
}
