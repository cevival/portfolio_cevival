import React, { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Reveal, RevealText } from "../motion/Reveal";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";
import { stack, type Tech, type TechGroup } from "../../data/stack";
import { brandIcons } from "../../data/stack-icons";

// Les logos dont la couleur de marque est le noir prennent la couleur du
// texte, pour rester lisibles en thème sombre.
const MONO_LOGOS = new Set(["000000", "0A0A0A"]);
// Une couleur de la stack par groupe : c'est la tranche de ses briques
const GROUP_TONES = ["violet", "jaune", "rouge", "bleu"];
// Nombre de briques en train de tomber au même instant
const OVERLAP = 3;

function TechLogo({ tech }: Readonly<{ tech: Tech }>) {
  if (!tech.icon) {
    return (
      <span className="brick-initial" aria-hidden="true">
        {tech.name[0]}
      </span>
    );
  }
  const { hex, path } = brandIcons[tech.icon];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill={MONO_LOGOS.has(hex) ? "currentColor" : `#${hex}`}>
      <path d={path} />
    </svg>
  );
}

/** Une brique : elle tombe à sa place quand le défilement atteint son rang. */
function Brick({
  tech,
  index,
  total,
  progress,
}: Readonly<{ tech: Tech; index: number; total: number; progress: MotionValue<number> }>) {
  const { lang } = useLang();
  const span = total + OVERLAP;
  const landing = useTransform(progress, [index / span, (index + OVERLAP) / span], [0, 1], { clamp: true });
  const y = useTransform(landing, [0, 1], [-34, 0]);
  const opacity = useTransform(landing, [0, 0.55], [0, 1]);

  return (
    <motion.li className="brick" style={{ y, opacity }}>
      <TechLogo tech={tech} />
      <span className="brick-name">{tech.name}</span>
      <span className="brick-use">{tech.usage[lang]}</span>
    </motion.li>
  );
}

function Group({ group, tone }: Readonly<{ group: TechGroup; tone: string }>) {
  const { lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  // De l'entrée du groupe par le bas de la fenêtre jusqu'à son milieu
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.94", "start 0.42"] });

  return (
    <div ref={ref} className="stack-group" style={{ "--brick": `var(--${tone})` } as React.CSSProperties}>
      <h3 className="stack-label">{group.label[lang]}</h3>
      <ul className="bricks">
        {group.items.map((tech, i) => (
          <Brick key={tech.name} tech={tech} index={i} total={group.items.length} progress={scrollYProgress} />
        ))}
      </ul>
    </div>
  );
}

export default function Stack() {
  const { lang } = useLang();
  const t = translations.stack;

  return (
    <section id="stack" className="section">
      <div className="section-inner">
        <div className="section-head">
          <h2 className="heading">
            <RevealText text={t.title[lang]} />
          </h2>
          <Reveal delay={0.15}>
            <p className="lede">{t.lede[lang]}</p>
          </Reveal>
        </div>

        <div>
          {stack.map((group, i) => (
            <Group key={group.label.fr} group={group} tone={GROUP_TONES[i % GROUP_TONES.length]} />
          ))}
        </div>
      </div>
    </section>
  );
}
