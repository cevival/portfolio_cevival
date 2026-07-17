import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { ArrowDown, Mail, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { animate, stagger } from "animejs";
import { GitHubIcon, LinkedInIcon } from "../ui/brand-icons";
import { Button } from "../ui/button";
import { useLang } from "../../context/LangContext";
import { translations } from "../../i18n/translations";

const HeroScene = lazy(() => import("../three/HeroScene"));

/** Scrolls to an anchor through Lenis when active (inertial), else natively. */
function scrollToId(id: string) {
  const lenis = (window as unknown as { lenis?: { scrollTo: (t: string) => void } })
    .lenis;
  if (lenis) lenis.scrollTo(`#${id}`);
  else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/**
 * The 3D scene is decorative: if it fails to load (WebGL unavailable, stale
 * dev cache, network error), render nothing instead of crashing the page.
 */
class SceneBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Splits a word into letter spans so anime.js can animate them one by one.
 * `className` is applied to EACH letter (not the wrapper): the animation
 * leaves a transform on every span, and a transform on a child breaks
 * background-clip:text gradients declared on the parent.
 */
function AnimatedWord({ word, className }: { word: string; className?: string }) {
  return (
    <span aria-label={word}>
      {word.split("").map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          aria-hidden
          className={`hero-letter inline-block ${className ?? ""}`}
          style={{ opacity: 0 }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const { lang } = useLang();
  const t = translations.hero;
  const [mounted, setMounted] = useState(false);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll parallax: content drifts up and fades, scene zooms out slightly
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  useEffect(() => setMounted(true), []);

  // Letter-by-letter apparition of the name (anime.js)
  useEffect(() => {
    if (!nameRef.current) return;
    const letters = nameRef.current.querySelectorAll(".hero-letter");
    animate(letters, {
      opacity: [0, 1],
      translateY: [42, 0],
      rotateX: [-70, 0],
      duration: 850,
      delay: stagger(38, { start: 250 }),
      ease: "outExpo",
    });
  }, []);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 26, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
  });

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-16 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[hsl(var(--primary)/0.08)] rounded-full blur-3xl animate-float"
          style={{ animationDuration: "7s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#06b6d4]/[0.06] rounded-full blur-3xl animate-float"
          style={{ animationDuration: "9s", animationDelay: "2s" }}
        />
        <div className="absolute inset-0 grid-bg opacity-40" />
      </div>

      {/* 3D WebGL scene (client only; static single frame for reduced motion) */}
      {mounted && (
        <SceneBoundary>
          <Suspense fallback={null}>
            <motion.div
              className="absolute inset-0"
              style={{ scale: sceneScale, opacity: sceneOpacity }}
            >
              <HeroScene />
            </motion.div>
          </Suspense>
        </SceneBoundary>
      )}

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {/* Available tag */}
        <motion.div
          {...fadeUp(0.1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          {t.available[lang]}
        </motion.div>

        {/* Greeting */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-lg text-[hsl(var(--muted-foreground))] mb-3"
        >
          {t.greeting[lang]}
        </motion.p>

        {/* Name — animated letter by letter */}
        <h1
          ref={nameRef}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4 [perspective:600px]"
        >
          <AnimatedWord word="Guillaume" className="gradient-text text-glow" />
          <br />
          <AnimatedWord
            word="Desplan"
            className="text-[hsl(var(--foreground))]"
          />
        </h1>

        {/* Title */}
        <motion.h2
          {...fadeUp(0.45)}
          className="text-2xl md:text-3xl font-semibold text-[hsl(var(--muted-foreground))] mb-6"
        >
          {t.title[lang]}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.55)}
          className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t.subtitle[lang]}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUp(0.7)}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Button
            size="lg"
            onClick={() => scrollToId("projects")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {t.cta_projects[lang]}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => scrollToId("contact")}
          >
            {t.cta_contact[lang]}
          </Button>
        </motion.div>

        {/* Social links */}
        <motion.div
          {...fadeUp(0.85)}
          className="flex items-center justify-center gap-4"
        >
          {[
            {
              href: "https://github.com/cevival",
              label: "GitHub",
              Icon: GitHubIcon,
            },
            {
              href: "https://www.linkedin.com/in/guillaume-desplan-36008a2a2",
              label: "LinkedIn",
              Icon: LinkedInIcon,
            },
            {
              href: "mailto:desplan.guillaume33@gmail.com",
              label: "Email",
              Icon: Mail,
            },
          ].map(({ href, label, Icon }) => (
            <motion.a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.92 }}
              className="p-2 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ArrowDown className="h-5 w-5" />
      </a>
    </section>
  );
}
