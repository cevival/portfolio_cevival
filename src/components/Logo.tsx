import React from "react";
import { motion } from "motion/react";

const draw = (delay: number) => ({
  hidden: { pathLength: 0 },
  show: {
    pathLength: 1,
    transition: { duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] as const },
  },
});

/**
 * Monogramme « GD » : deux lettres tracées au même trait épais, et la barre
 * du G en couleur d'accent. Les lettres se dessinent au chargement ; au
 * survol, la barre clignote comme un curseur de texte.
 */
export function Logo({ className }: Readonly<{ className?: string }>) {
  return (
    <motion.svg
      viewBox="0 0 62 32"
      fill="none"
      aria-hidden="true"
      className={className}
      initial="hidden"
      animate="show"
      whileHover="hover"
    >
      <motion.path
        d="M23.71 6.81A12 12 0 1 0 28 16"
        stroke="currentColor"
        strokeWidth="8"
        variants={draw(0.1)}
      />
      <motion.path
        d="M40 4h6a12 12 0 0 1 0 24h-6Z"
        stroke="currentColor"
        strokeWidth="8"
        variants={draw(0.3)}
      />
      <motion.rect
        x="16"
        y="12"
        width="16"
        height="8"
        fill="var(--accent-solid)"
        style={{ originX: 1 }}
        variants={{
          hidden: { scaleX: 0 },
          show: {
            scaleX: 1,
            transition: { delay: 0.85, type: "spring", stiffness: 320, damping: 18 },
          },
          hover: {
            opacity: [1, 0, 1, 0, 1],
            transition: { duration: 0.9, times: [0, 0.2, 0.45, 0.65, 1] },
          },
        }}
      />
    </motion.svg>
  );
}
