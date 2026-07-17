import React from "react";
import { motion } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  /** Delay in seconds before the animation starts */
  delay?: number;
  /** Vertical offset in px the element travels from */
  y?: number;
  /** Animate only the first time the element enters the viewport */
  once?: boolean;
  className?: string;
}

/**
 * Fade-up apparition when the element scrolls into view.
 * Reduced-motion handling comes from <MotionConfig reducedMotion="user">
 * at the root: transforms are skipped, opacity still fades (SSR-consistent).
 */
export function Reveal({
  children,
  delay = 0,
  y = 32,
  once = true,
  className,
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, scale: 0.94, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  /** Seconds between each child apparition */
  gap?: number;
  className?: string;
}

/** Container that reveals its <StaggerItem> children one after the other. */
export function Stagger({ children, gap = 0.12, className }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 36, scale: 0.94, filter: "blur(8px)" },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
