import React from "react";
import { motion } from "motion/react";

export const EASE = [0.2, 0.7, 0.2, 1] as const;

// L'animation part quand l'élément a dépassé le bas de la fenêtre de 12 %
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Variante d'un enfant : monte en fondu quand son parent passe à « show ». */
export const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/**
 * Props à poser sur un conteneur `motion.*` pour que ses enfants porteurs de
 * la variante `rise` apparaissent l'un après l'autre à l'entrée dans la fenêtre.
 */
export const stagger = (gap = 0.07) => ({
  initial: "hidden",
  whileInView: "show",
  viewport: VIEWPORT,
  transition: { staggerChildren: gap },
});

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/** Fait monter son contenu en fondu à l'entrée dans la fenêtre. */
export function Reveal({ children, className, delay = 0 }: Readonly<RevealProps>) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Titre dont chaque mot monte derrière un masque. Le texte complet reste lu
 * d'un bloc par les lecteurs d'écran.
 */
export function RevealText({ text }: Readonly<{ text: string }>) {
  const words = text.split(" ");

  return (
    <>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        className="reveal-text"
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        transition={{ staggerChildren: 0.08 }}
      >
        {words.map((word, i) => (
          <React.Fragment key={`${word}-${i}`}>
            <span className="reveal-word">
              <motion.span
                variants={{
                  hidden: { y: "115%" },
                  show: { y: 0, transition: { duration: 0.85, ease: EASE } },
                }}
              >
                {word}
              </motion.span>
            </span>{" "}
          </React.Fragment>
        ))}
      </motion.span>
    </>
  );
}
