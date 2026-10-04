import React, { useEffect, useMemo, useRef, useState } from "react";
import { Mail } from "lucide-react";
import {
  motion,
  motionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { GitHubIcon, LinkedInIcon } from "../ui/brand-icons";
import { BrowserFrame } from "../BrowserFrame";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";
import { featured } from "../../data/projects";
import { site } from "../../data/site";

const socials = [
  { href: site.github.url, label: "GitHub", Icon: GitHubIcon },
  { href: site.linkedin.url, label: "LinkedIn", Icon: LinkedInIcon },
  { href: `mailto:${site.email}`, label: "E-mail", Icon: Mail },
];

// Ombres des trois fenêtres : violet, rouge, jaune
const tones = ["violet", "rouge", "jaune"] as const;

// Le rang d'apparition est porté par --i (voir .hero-fade dans global.css)
const step = (i: number) => ({ "--i": i }) as React.CSSProperties;

const NAME_LINES = ["Guillaume", "Desplan"];
// Rayon d'influence du curseur sur les lettres, en pixels
const POINTER_RADIUS = 240;

/**
 * Une lettre du nom. `proximity` va de 0 (lettre au repos : grasse et étroite)
 * à 1 (curseur dessus : fine et large), sur les axes de la police variable.
 */
function Letter({
  char,
  proximity,
  delay,
  register,
}: Readonly<{
  char: string;
  proximity: MotionValue<number>;
  delay: number;
  register: (el: HTMLSpanElement | null) => void;
}>) {
  const smooth = useSpring(proximity, { stiffness: 210, damping: 20, mass: 0.6 });
  const weight = useTransform(smooth, [0, 1], [800, 240]);
  const width = useTransform(smooth, [0, 1], [75, 100]);
  const fontVariationSettings = useMotionTemplate`"wght" ${weight}, "wdth" ${width}`;

  return (
    <motion.span
      ref={register}
      className="hero-letter"
      style={{ fontVariationSettings }}
      initial={{ y: "112%" }}
      animate={{ y: 0 }}
      transition={{ delay, duration: 0.95, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {char}
    </motion.span>
  );
}

function HeroName() {
  const letterCount = NAME_LINES.join("").length;
  // Les lettres arrivent fines (1), puis s'épaississent une à une (0)
  const proximities = useMemo(
    () => Array.from({ length: letterCount }, () => motionValue(1)),
    [letterCount],
  );
  const letters = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const timers = proximities.map((value, i) =>
      setTimeout(() => value.set(0), 320 + i * 55),
    );
    return () => timers.forEach(clearTimeout);
  }, [proximities]);

  // Les lettres proches du curseur s'affinent et s'élargissent
  useEffect(() => {
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const update = () => {
      frame = 0;
      letters.current.forEach((el, i) => {
        if (!el) return;
        if (!pointer) {
          proximities[i].set(0);
          return;
        }
        const rect = el.getBoundingClientRect();
        const distance = Math.hypot(
          pointer.x - (rect.left + rect.width / 2),
          pointer.y - (rect.top + rect.height / 2),
        );
        const near = Math.max(0, 1 - distance / POINTER_RADIUS);
        proximities[i].set(near * near);
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    globalThis.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      globalThis.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [proximities]);

  let index = 0;
  return (
    <h1 className="display hero-name">
      <span className="sr-only">{site.name}</span>
      {NAME_LINES.map((line) => (
        <span key={line} className="hero-line" aria-hidden="true">
          {line.split("").map((char) => {
            const i = index++;
            return (
              <Letter
                key={i}
                char={char}
                proximity={proximities[i]}
                delay={0.05 + i * 0.035}
                register={(el) => {
                  letters.current[i] = el;
                }}
              />
            );
          })}
        </span>
      ))}
    </h1>
  );
}

/** Les trois fenêtres empilées, déplaçables à la souris comme sur un bureau. */
function HeroWindows() {
  const { lang } = useLang();
  const t = translations.hero;
  const stackRef = useRef<HTMLDivElement>(null);
  // Ordre d'empilement : le dernier indice est au-dessus
  const [order, setOrder] = useState([0, 1, 2]);
  const [dragging, setDragging] = useState<number | null>(null);
  // Au doigt, glisser sur une fenêtre doit faire défiler la page
  const [canDrag, setCanDrag] = useState(false);
  const justDragged = useRef(false);

  useEffect(() => {
    setCanDrag(globalThis.matchMedia("(pointer: fine)").matches);
  }, []);

  const bringToFront = (i: number) =>
    setOrder((prev) => [...prev.filter((n) => n !== i), i]);

  return (
    <div>
      <div
        ref={stackRef}
        className="hero-stack"
        role="group"
        aria-label={t.stack_label[lang]}
      >
        {featured.map((project, i) => (
          <motion.div
            key={project.slug}
            className="hero-win"
            data-draggable={canDrag}
            data-dragging={dragging === i}
            style={{ zIndex: order.indexOf(i) + 1 }}
            initial={{ opacity: 0, x: 22, y: 34, rotate: 2.5 }}
            animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            transition={{
              delay: 0.5 + i * 0.16,
              type: "spring",
              stiffness: 110,
              damping: 16,
            }}
            drag={canDrag}
            dragConstraints={stackRef}
            dragElastic={0.2}
            dragTransition={{ power: 0.2, bounceStiffness: 320, bounceDamping: 24 }}
            whileDrag={{ scale: 1.03, rotate: -1.2 }}
            onPointerDown={() => bringToFront(i)}
            onDragStart={() => {
              justDragged.current = true;
              setDragging(i);
            }}
            onDragEnd={() => {
              setDragging(null);
              // Le clic qui suit le relâchement ne doit pas ouvrir le site
              setTimeout(() => {
                justDragged.current = false;
              }, 50);
            }}
            onClickCapture={(e) => {
              if (!justDragged.current) return;
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <BrowserFrame
              url={project.url}
              domain={project.domain}
              shot={project.shot}
              tone={tones[i % tones.length]}
              label={`${t.open_site[lang]} ${project.domain}`}
              liveLabel={t.live[lang]}
              sizes="(min-width: 64rem) 26rem, 78vw"
              eager
            />
          </motion.div>
        ))}
      </div>

      {canDrag && (
        <p className="hero-fade meta mt-5 text-center text-muted" style={step(9)}>
          {t.drag_hint[lang]}
        </p>
      )}
    </div>
  );
}

export default function Hero() {
  const { lang } = useLang();
  const t = translations.hero;

  return (
    <section id="top" className="hero">
      <div className="hero-copy">
        <p
          className="hero-fade meta flex items-center gap-2.5 text-muted"
          style={step(0)}
        >
          <span className="live-dot live-dot--pulse" aria-hidden="true" />
          {t.available[lang]}
        </p>

        <HeroName />

        <p
          className="hero-fade text-2xl font-semibold [font-stretch:88%] sm:text-3xl"
          style={step(4)}
        >
          {t.title[lang]}
        </p>
        <p className="hero-fade lede mt-3" style={step(5)}>
          {t.subtitle[lang]}
        </p>

        <div
          className="hero-fade mt-8 flex flex-wrap items-center gap-3"
          style={step(6)}
        >
          <a href="#projects" className="btn btn--solid">
            {t.cta_projects[lang]}
          </a>
          <a href="#contact" className="btn">
            {t.cta_contact[lang]}
          </a>
          <ul className="flex items-center gap-2 sm:ml-2">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="icon-btn h-[2.875rem] w-[2.875rem]"
                >
                  <Icon className="h-[1.125rem] w-[1.125rem]" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <HeroWindows />
    </section>
  );
}
