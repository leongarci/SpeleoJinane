import type { SceneId } from "./types";

export type StoryBeat = {
  id: SceneId;
  bg: "beach" | "cave" | "sky" | "rappel";
  portrait: "jinane" | "leon" | null;
  lines: string[];
  hint?: string;
  next: SceneId;
  cta: string;
};

export const STORIES: StoryBeat[] = [
  {
    id: "story-beach",
    bg: "beach",
    portrait: "leon",
    lines: [
      "Ia ora na Jinane…",
      "Pendant que tu es encore sous les palmiers, un message voyage jusqu'à toi.",
      "Léon a un plan. Un vrai. Sous terre.",
      "Mais d'abord… rassemble tes affaires !",
    ],
    hint: "Ramasse le billet, le sac et la lampe. Évite les crabes. 3 chocs = on recommence.",
    next: "beach",
    cta: "Aller sur la plage",
  },
  {
    id: "story-flight",
    bg: "sky",
    portrait: "jinane",
    lines: [
      "Décollage.",
      "Le lagon rétrécit derrière toi.",
      "Direction la France. Sainte-Marie-aux-Mines.",
      "Le parc Tellure t'attend.",
    ],
    next: "story-mine",
    cta: "Continuer",
  },
  {
    id: "story-mine",
    bg: "cave",
    portrait: "leon",
    lines: [
      "Mine Saint-Jean Engelsbourg. 1549.",
      "Il fait environ 10°C. Tout l'équipement est fourni.",
      "Ta lampe est ta seule amie dans le noir.",
      "Trouve 3 pépites d'argent, puis la sortie.",
    ],
    hint: "Déplace-toi avec la croix. La lumière ne va pas loin.",
    next: "maze",
    cta: "Entrer dans la mine",
  },
  {
    id: "story-rappel",
    bg: "rappel",
    portrait: "leon",
    lines: [
      "Les puits du fond.",
      "La descente s'accélère. Tiens 40 secondes.",
      "Esquive les blocs. Gauche, droite.",
      "Tu es prête ?",
    ],
    hint: "Tiens 40 secondes. 3 chocs = on recommence.",
    next: "rappel",
    cta: "Descendre",
  },
];
