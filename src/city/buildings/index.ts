import type { StopId } from "../layout";
import { atelier } from "./atelier";
import { drSalti } from "./dr-salti";
import { drivingSchool } from "./driving-school";
import { garage } from "./garage";
import { lot } from "./lot";
import { marque } from "./marque";
import { qualitrack } from "./qualitrack";
import { sasportas } from "./sasportas";
import type { Builder } from "./shared";
import { shop } from "./shop";
import { station } from "./station";
import { studio } from "./studio";
import { theatre } from "./theatre";

export { lotBillboard } from "./lot";
export type { BuildContext, Builder } from "./shared";

/** Un constructeur par parcelle : chaque site livré a son bâtiment */
export const builders: Record<StopId, Builder> = {
  qualitrack,
  "dr-salti": drSalti,
  sasportas,
  "points-rambrouch": garage,
  "thill-loehr": station,
  "jour-de-rien": theatre,
  marque,
  lbshop: shop,
  "lbdigital-site": studio,
  "sc-conduite": drivingSchool,
  portfolio: atelier,
  lot,
};
