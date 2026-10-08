import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
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

  // Le portrait glisse un peu moins vite que la page
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [28, -28]);

  return (
    <section ref={sectionRef} id="about" className="section">
      <div className="section-inner">
        <div className="section-head">
          <h2 className="heading">
            <RevealText text={t.title[lang]} />
          </h2>
          <motion.div
            className="portrait"
            style={{ y: drift }}
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
            viewport={VIEWPORT}
            transition={{ delay: 0.15, duration: 0.9, ease: EASE }}
          >
            <img src={moi.src} width={moi.width} height={moi.height} alt={t.portrait_alt[lang]} decoding="async" loading="lazy" />
          </motion.div>
        </div>

        <div>
          <motion.div {...stagger(0.1)}>
            <motion.p variants={rise} className="max-w-[38em] text-[1.1875rem] leading-relaxed">
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
