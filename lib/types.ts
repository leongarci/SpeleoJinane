export type SceneId =
  | "title"
  | "story-beach"
  | "beach"
  | "story-flight"
  | "story-mine"
  | "maze"
  | "story-rappel"
  | "rappel"
  | "invite"
  | "ending";

export type DurationId = "3h" | "4h" | "6h";

export type Rsvp = {
  coming: boolean | null;
  duration: DurationId | null;
  date: string | null;
};

export type Controls = { x: number; y: number };
