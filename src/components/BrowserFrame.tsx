import React from "react";
import type { Shot, Tone } from "../data/projects";

interface BrowserFrameProps {
  url: string;
  domain: string;
  shot: Shot;
  tone: Tone;
  /** Texte du lien pour les lecteurs d'écran, ex. « Ouvrir qualitrack-app.fr » */
  label: string;
  liveLabel: string;
  sizes: string;
  /** Charge l'image tout de suite (au-dessus de la ligne de flottaison) */
  eager?: boolean;
  style?: React.CSSProperties;
}

/** Fenêtre de navigateur cliquable : barre d'adresse + capture du site en ligne. */
export function BrowserFrame({
  url,
  domain,
  shot,
  tone,
  label,
  liveLabel,
  sizes,
  eager = false,
  style,
}: Readonly<BrowserFrameProps>) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      draggable={false}
      className={`win win--${tone}`}
      style={style}
    >
      <span className="win-bar" aria-hidden="true">
        <span className="win-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="win-url">{domain}</span>
        <span className="win-live">
          <span className="live-dot" />
          {liveLabel}
        </span>
      </span>
      <img
        src={shot.src}
        srcSet={shot.srcSet}
        sizes={sizes}
        width={shot.width}
        height={shot.height}
        alt=""
        draggable={false}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </a>
  );
}
