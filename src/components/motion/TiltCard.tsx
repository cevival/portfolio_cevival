import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max rotation in degrees */
  intensity?: number;
  /** Show the moving light reflection */
  glare?: boolean;
}

/**
 * 3D tilt card: rotates towards the cursor with a spring, plus an optional
 * "glare" light reflection following the pointer. Inert on touch devices
 * and when the user prefers reduced motion.
 */
export function TiltCard({
  children,
  className,
  intensity = 10,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const px = useMotionValue(0.5); // pointer position, 0..1
  const py = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(py, [0, 1], [intensity, -intensity]),
    { stiffness: 260, damping: 22 },
  );
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-intensity, intensity]),
    { stiffness: 260, damping: 22 },
  );

  const glareX = useTransform(px, [0, 1], [0, 100]);
  const glareY = useTransform(py, [0, 1], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, hsl(var(--primary) / 0.14), transparent 55%)`;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === "touch" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={
        reduced
          ? undefined
          : { rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 900 }
      }
    >
      {children}
      {glare && !reduced && (
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-20"
          style={{ background: glareBg }}
        />
      )}
    </motion.div>
  );
}
