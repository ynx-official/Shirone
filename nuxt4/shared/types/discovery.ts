export type AnimeStatus =
  | "watching"
  | "completed"
  | "planned"
  | "onHold"
  | "dropped";
export interface AnimeData {
  title: string;
  cover?: string;
  link?: string;
  status: AnimeStatus;
  rating: number;
  progress?: { watched: number; total: number };
  description?: string;
  year: string;
  studio?: string;
  genres: string[];
}
export interface CompassEntry {
  label: string;
  href: string;
  note?: string;
  icon?: string;
  image?: string;
}
export interface CompassShelf {
  key: string;
  name: string;
  icon?: string;
  blurb?: string;
  entries: CompassEntry[];
}
