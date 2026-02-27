import React from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { LangProvider } from "../context/LangContext";
import Navbar from "./Navbar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";

export default function Portfolio() {
  return (
    <ThemeProvider>
      <LangProvider>
        <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          <Navbar />
          <main>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Experience />
            <Contact />
          </main>
        </div>
      </LangProvider>
    </ThemeProvider>
  );
}
