import React from "react";
import { motion } from "motion/react";
import { Reveal, RevealText, rise, stagger } from "../motion/Reveal";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";
import { stack, type Tech, type TechGroup } from "../../data/stack";
import { brandIcons } from "../../data/stack-icons";

// Les logos dont la couleur de marque est le noir prennent la couleur du
// texte, pour rester lisibles en thème sombre.
const MONO_LOGOS = new Set(["000000", "0A0A0A"]);

// Au survol d'une cellule, son logo se penche et grossit
const logoHover = {
  hover: {
    rotate: -10,
    scale: 1.22,
    transition: { type: "spring" as const, stiffness: 380, damping: 12 },
  },
};

function TechLogo({ tech }: Readonly<{ tech: Tech }>) {
  if (!tech.icon) {
    return (
      <motion.span className="tech-fallback" aria-hidden="true" variants={logoHover}>
        {tech.name[0]}
      </motion.span>
    );
  }
  const { hex, path } = brandIcons[tech.icon];
  return (
    <motion.svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={MONO_LOGOS.has(hex) ? "currentColor" : `#${hex}`}
      variants={logoHover}
    >
      <path d={path} />
    </motion.svg>
  );
}

function Group({ group }: Readonly<{ group: TechGroup }>) {
  const { lang } = useLang();

  return (
    <div className="stack-group">
      <h3 className="text-xl font-bold [font-stretch:85%]">
        <RevealText text={group.label[lang]} />
      </h3>
      <motion.ul className="cells stack-cells m-0 list-none p-0" {...stagger(0.045)}>
        {group.items.map((tech) => (
          <motion.li
            key={tech.name}
            className="tech"
            variants={rise}
            whileHover="hover"
          >
            <TechLogo tech={tech} />
            <span className="font-semibold leading-tight">{tech.name}</span>
            <span className="text-sm leading-snug text-muted">
              {tech.usage[lang]}
            </span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export default function Stack() {
  const { lang } = useLang();
  const t = translations.stack;

  return (
    <section id="stack" className="band">
      <div className="band-head">
        <h2 className="heading">
          <RevealText text={t.title[lang]} />
        </h2>
        <Reveal delay={0.15}>
          <p className="lede">{t.lede[lang]}</p>
        </Reveal>
      </div>

      {stack.map((group) => (
        <Group key={group.label.fr} group={group} />
      ))}
    </section>
  );
}
