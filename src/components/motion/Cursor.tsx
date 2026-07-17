import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Custom cursor: a small violet dot glued to the pointer plus a glowing ring
 * that trails it with a spring, growing over links and buttons. Only mounts
 * on precise-pointer devices (desktop); the native cursor stays visible.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as Element | null;
      setHovering(!!target?.closest("a, button, [role='button']"));
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="hidden md:block">
      {/* Trailing ring */}
      <motion.div
        className="fixed top-0 left-0 z-[70] pointer-events-none rounded-full
          border border-[hsl(var(--primary)/0.6)]
          shadow-[0_0_12px_-2px_hsl(var(--primary)/0.5)]"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 44 : 30,
          height: hovering ? 44 : 30,
          backgroundColor: hovering
            ? "hsl(262 80% 58% / 0.12)"
            : "hsl(262 80% 58% / 0)",
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Center dot */}
      <motion.div
        className="fixed top-0 left-0 z-[70] pointer-events-none h-1.5 w-1.5
          rounded-full bg-[hsl(var(--primary))]"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      />
    </div>
  );
}
