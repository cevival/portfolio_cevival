import { STOP_IDS, type StopId } from "../city/layout";
import { toneAt, type Tone } from "../city/palette";
import { featured, more, type Project } from "./projects";

export interface TourStop {
  id: StopId;
  /** Couleur de l'arrêt, la même que celle de son bâtiment */
  tone: Tone;
  /** Absent pour le dernier arrêt, le terrain à bâtir */
  project?: Project;
  featured: boolean;
}

const projects = [...featured, ...more];

/** Les 12 arrêts de la visite : les 11 projets dans l'ordre de la ville, puis le terrain. */
export const tourStops: TourStop[] = STOP_IDS.map((id, index) => {
  const project = projects.find((candidate) => candidate.slug === id);
  // Un bâtiment sans projet resterait un arrêt vide : autant le savoir au build
  if (!project && id !== "lot") throw new Error(`Aucun projet pour l'arrêt « ${id} »`);
  return {
    id,
    tone: toneAt(index),
    project,
    featured: featured.some((candidate) => candidate.slug === id),
  };
});
