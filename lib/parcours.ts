import type { DurationId } from "./types";

export type Parcours = {
  id: DurationId;
  hours: string;
  title: string;
  subtitle: string;
  blurb: string;
};

export const PARCOURS: Parcours[] = [
  {
    id: "3h",
    hours: "3 h",
    title: "Puits du Fond",
    subtitle: "ou Mine de Zinc",
    blurb: "Parcours sportif au cœur de la montagne : descentes sur corde, labyrinthe minier en 3D, escalades et rappels.",
  },
  {
    id: "4h",
    hours: "4 h",
    title: "Colonne St Jean",
    subtitle: "120 m de descente ludique",
    blurb: "Tyrolienne, pendule, et un rappel plein gaz de 50 m. Le grand classique sportif de Tellure.",
  },
  {
    id: "6h",
    hours: "6 h",
    title: "Armée Céleste",
    subtitle: "160 m · pique-nique inclus",
    blurb: "Vaste réseau XVIe et XVIIIe : nombreux rappels, passages aériens et aquatiques. L'expédition complète.",
  },
];

export function parcoursById(id: DurationId): Parcours {
  return PARCOURS.find((p) => p.id === id)!;
}
