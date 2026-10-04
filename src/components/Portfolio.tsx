import React from "react";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "../context/ThemeContext";
import { LangProvider, useLang } from "../context/LangContext";
import { translations } from "../i18n/translations";
import { site } from "../data/site";
import { featured, more } from "../data/projects";
import Navbar from "./Navbar";
import { SmoothScroll } from "./motion/SmoothScroll";
import { Ticker } from "./motion/Ticker";
import Hero from "./sections/Hero";
import Projects from "./sections/Projects";
import Stack from "./sections/Stack";
import Experience from "./sections/Experience";
import About from "./sections/About";
import Contact from "./sections/Contact";

// Domaines des sites en ligne, pour le bandeau défilant sous le hero
const liveDomains = [...featured, ...more].map((project) => project.domain);

function Footer() {
  const { lang } = useLang();

  return (
    <footer className="band meta flex flex-wrap justify-between gap-x-8 gap-y-2 !py-7 text-muted">
      <p>
        © {new Date().getFullYear()} {site.name}
      </p>
      <p>{translations.footer.built[lang]}</p>
    </footer>
  );
}

export default function Portfolio() {
  return (
    // reducedMotion="never": animations stay visible even on devices
    // reporting prefers-reduced-motion
    <MotionConfig reducedMotion="never">
      <ThemeProvider>
        <LangProvider>
          <SmoothScroll />
          <Navbar />
          <div className="shell shell--rails">
            <main>
              <Hero />
              <Ticker items={liveDomains} />
              <Projects />
              <Stack />
              <Experience />
              <About />
              <Contact />
            </main>
            <Footer />
          </div>
        </LangProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
