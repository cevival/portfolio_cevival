import React, { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

// Nombre de copies de la liste : la piste se décale d'une copie puis reboucle
const COPIES = 4;
// Vitesse de croisière, en % de la piste par seconde (négatif = vers la gauche)
const BASE_SPEED = -1.1;

const wrap = (min: number, max: number, value: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

/**
 * Bandeau défilant en continu. Le défilement de la page l'accélère, et
 * remonter la page inverse son sens.
 */
export function Ticker({ items }: Readonly<{ items: string[] }>) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-100 / COPIES, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    const factor = boost.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;

    let move = direction.current * BASE_SPEED * (delta / 1000);
    move += direction.current * move * factor;
    baseX.set(baseX.get() + move);
  });

  return (
    <div className="ticker" aria-hidden="true">
      <motion.div className="ticker-track" style={{ x }}>
        {Array.from({ length: COPIES }, (_, copy) => (
          <div key={copy} className="ticker-group">
            {items.map((item) => (
              <span key={item} className="ticker-item">
                <i />
                {item}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
