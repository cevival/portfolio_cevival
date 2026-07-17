import React from "react";
import { motion, useScroll, useSpring } from "motion/react";

/** Thin violet→cyan gradient bar at the very top, filling as the page scrolls. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left
        bg-gradient-to-r from-[hsl(var(--primary))] via-[#8b5cf6] to-[#06b6d4]
        shadow-[0_0_10px_hsl(var(--primary)/0.6)]"
      style={{ scaleX }}
    />
  );
}
