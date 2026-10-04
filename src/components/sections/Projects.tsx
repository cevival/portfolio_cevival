import React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { GitHubIcon } from "../ui/brand-icons";
import { BrowserFrame } from "../BrowserFrame";
import { Reveal, RevealText, rise, stagger } from "../motion/Reveal";
import { useLang } from "../../context/LangContext";
import { useReveal } from "../../hooks/useReveal";
import { translations } from "../../i18n/translations";
import { featured, more, type FeaturedProject } from "../../data/projects";

function Feature({ project }: Readonly<{ project: FeaturedProject }>) {
  const { lang } = useLang();
  const t = translations.projects;
  const articleRef = useReveal<HTMLElement>();

  // La fenêtre dérive doucement dans son présentoir pendant le défilement
  const { scrollYProgress } = useScroll({
    target: articleRef,
    offset: ["start end", "end start"],
  });
  const drift = useSpring(useTransform(scrollYProgress, [0, 1], [16, -16]), {
    stiffness: 120,
    damping: 26,
  });

  return (
    <article ref={articleRef} data-reveal className="feature">
      <div
        className={`stage stage--${project.tone}`}
        // Une fois l'ombre posée, la fenêtre reprend ses transitions de survol rapides
        onTransitionEnd={(e) => {
          if (e.propertyName === "box-shadow")
            e.currentTarget.parentElement?.classList.add("settled");
        }}
      >
        <motion.div style={{ y: drift }}>
          <BrowserFrame
            url={project.url}
            domain={project.domain}
            shot={project.shot}
            tone={project.tone}
            label={`${translations.hero.open_site[lang]} ${project.domain}`}
            liveLabel={translations.hero.live[lang]}
            sizes="(min-width: 56rem) 40rem, 90vw"
          />
        </motion.div>
      </div>

      <motion.div {...stagger(0.08)}>
        <motion.p variants={rise} className="meta text-muted">
          {project.kind[lang]}
        </motion.p>
        <motion.h3
          variants={rise}
          className="mt-2 text-3xl font-bold leading-tight [font-stretch:85%] sm:text-4xl"
        >
          {project.title}
        </motion.h3>
        <motion.p variants={rise} className="mt-4 text-muted">
          {project.description[lang]}
        </motion.p>
        <motion.ul variants={rise} className="tags mt-5">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </motion.ul>
        <motion.a
          variants={rise}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link mt-6 inline-flex items-center gap-1.5"
        >
          {t.visit[lang]} {project.domain}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </motion.a>
      </motion.div>
    </article>
  );
}

export default function Projects() {
  const { lang } = useLang();
  const t = translations.projects;

  return (
    <section id="projects" className="band">
      <div className="band-head">
        <h2 className="heading">
          <RevealText text={t.title[lang]} />
        </h2>
        <Reveal delay={0.15}>
          <p className="lede">{t.lede[lang]}</p>
        </Reveal>
      </div>

      <div>
        {featured.map((project) => (
          <Feature key={project.slug} project={project} />
        ))}
      </div>

      <h3 className="mb-6 mt-[clamp(4rem,8vw,6.5rem)] text-2xl font-bold [font-stretch:85%]">
        <RevealText text={t.more[lang]} />
      </h3>
      <motion.div className="cells more" {...stagger(0.06)}>
        {more.map((project) => (
          <motion.article key={project.slug} variants={rise} className="more-item">
            <span className="more-thumb">
              <img
                src={project.shot.src}
                srcSet={project.shot.srcSet}
                sizes="11rem"
                width={project.shot.width}
                height={project.shot.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </span>
            <div className="min-w-0">
              <h4 className="more-title text-lg font-bold leading-snug">
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  {project.title}
                </a>
              </h4>
              <p className="meta mt-0.5 flex items-center gap-1 text-accent">
                <span className="truncate">{project.domain}</span>
                <ArrowUpRight
                  className="arrow h-3.5 w-3.5 flex-none"
                  aria-hidden="true"
                />
              </p>
              <p className="mt-2 text-[0.9375rem] leading-normal text-muted">
                {project.description[lang]}
              </p>
              <ul className="tags mt-3">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="side-link link mt-3 inline-flex items-center gap-1.5 text-sm"
                >
                  <GitHubIcon className="h-3.5 w-3.5" />
                  {t.code[lang]}
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
