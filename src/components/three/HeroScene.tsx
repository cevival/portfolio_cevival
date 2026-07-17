import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// Accent colors of the palette (same as the CSS gradients: primary violet + cyan)
const VIOLET = "#8b5cf6";
const CYAN = "#06b6d4";

/** Distorted wireframe icosahedron slowly rotating, leaning towards the cursor. */
function CoreShape() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.15;
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      state.pointer.y * 0.35,
      2,
      delta,
    );
    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      -state.pointer.x * 0.35,
      2,
      delta,
    );
  });

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh>
          <icosahedronGeometry args={[1.9, 2]} />
          <MeshDistortMaterial
            color={VIOLET}
            wireframe
            distort={0.35}
            speed={1.6}
            transparent
            opacity={0.55}
          />
        </mesh>
        {/* Inner solid core with a faint glow */}
        <mesh scale={0.62}>
          <icosahedronGeometry args={[1.9, 1]} />
          <MeshDistortMaterial
            color={VIOLET}
            distort={0.25}
            speed={2}
            transparent
            opacity={0.08}
          />
        </mesh>
      </Float>
    </group>
  );
}

/** Cyan/violet particle field orbiting slowly around the shape. */
function Particles({ count = 350 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const violet = new THREE.Color(VIOLET);
    const cyan = new THREE.Color(CYAN);
    for (let i = 0; i < count; i++) {
      // Random point in a spherical shell (radius 2.6..5.5)
      const r = 2.6 + Math.random() * 2.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = Math.random() > 0.5 ? cyan : violet;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.03;
    points.current.rotation.x = THREE.MathUtils.damp(
      points.current.rotation.x,
      state.pointer.y * 0.15,
      1.5,
      delta,
    );
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * WebGL background of the hero section. Mounted client-side only (lazy),
 * pointer-events disabled so it never blocks the content above it.
 */
export default function HeroScene() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "none" }}
        eventSource={typeof document === "undefined" ? undefined : document.body}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 4, 4]} intensity={30} color={CYAN} />
        <pointLight position={[-4, -3, 2]} intensity={25} color={VIOLET} />
        <CoreShape />
        <Particles />
      </Canvas>
    </div>
  );
}
