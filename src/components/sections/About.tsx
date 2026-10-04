import React from "react";
import { motion } from "motion/react";
import { EASE, RevealText, VIEWPORT, rise, stagger } from "../motion/Reveal";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";
import moi from "../../assets/moi.webp";

export default function About() {
  const { lang } = useLang();
  const t = translations.about;

  const facts = [
    { label: t.location[lang], value: t.location_val[lang] },
    { label: t.status[lang], value: t.status_val[lang] },
    { label: t.formation[lang], value: t.formation_val[lang] },
    { label: t.languages_label[lang], value: t.languages_val[lang] },
  ];

  return (
    <section id="about" className="band">
      <div className="grid items-start gap-x-[clamp(2rem,6vw,5rem)] gap-y-12 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        {/* L'aplat jaune apparaît, la photo le recouvre, puis il se décale en ombre */}
        <motion.div
          className="portrait-wrap"
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          <motion.span
            aria-hidden="true"
            className="portrait-shadow"
            variants={{
              hidden: { opacity: 0, x: 0, y: 0 },
              show: {
                opacity: 1,
                x: 10,
                y: 10,
                transition: {
                  opacity: { duration: 0.3 },
                  default: { delay: 0.95, type: "spring", stiffness: 220, damping: 14 },
                },
              },
            }}
          />
          <motion.img
            src={moi.src}
            width={moi.width}
            height={moi.height}
            alt="Guillaume Desplan"
            decoding="async"
            className="portrait"
            variants={{
              hidden: { clipPath: "inset(0% 0% 100% 0%)" },
              show: {
                clipPath: "inset(0% 0% 0% 0%)",
                transition: { delay: 0.2, duration: 0.9, ease: EASE },
              },
            }}
          />
        </motion.div>

        <div>
          <h2 className="heading">
            <RevealText text={t.title[lang]} />
          </h2>
          <motion.div {...stagger(0.1)}>
            <motion.p
              variants={rise}
              className="mt-7 max-w-[38em] text-[1.1875rem] leading-relaxed"
            >
              {t.p1[lang]}
            </motion.p>
            <motion.p variants={rise} className="mt-4 max-w-[38em] text-muted">
              {t.p2[lang]}
            </motion.p>
          </motion.div>

          <motion.dl className="facts mt-9 max-w-[38em]" {...stagger(0.08)}>
            {facts.map(({ label, value }) => (
              <motion.div key={label} variants={rise}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
