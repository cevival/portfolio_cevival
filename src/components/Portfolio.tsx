import React from "react";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "../context/ThemeContext";
import { LangProvider, useLang } from "../context/LangContext";
import { translations } from "../i18n/translations";
import { site } from "../data/site";
import Navbar from "./Navbar";
import { CityProvider } from "./city/CityContext";
import { CityStage } from "./city/CityStage";
import { SmoothScroll } from "./motion/SmoothScroll";
import Journey from "./sections/Journey";
import Stack from "./sections/Stack";
import Experience from "./sections/Experience";
import About from "./sections/About";
import Contact from "./sections/Contact";

function Footer() {
  const { lang } = useLang();

  return (
    <footer className="footer meta">
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
          <CityProvider>
            <SmoothScroll />
            {/* La ville, fixe derrière la page */}
            <CityStage />
            <Navbar />
            <div className="page">
              <main>
                <Journey />
                {/* Le rideau : des sections opaques qui passent sur la ville */}
                <div className="curtain">
                  <Stack />
                  <Experience />
                  <About />
                </div>
                {/* Sous le rideau, la ville revient pour le final */}
                <Contact />
              </main>
              <Footer />
            </div>
          </CityProvider>
        </LangProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
