export type { Entity, Snapshot, Domain } from "../schemas/content";
export interface Post {
  id: string;
  title: string;
  description: string;
  published: string;
  tags: string[];
  category: string;
  series: string;
  image: string;
  url: string;
  pinned: boolean;
  protected: boolean;
  comment?: boolean;
  html?: string;
  toc?: { id: string; text: string; depth: number }[];
  syntaxes?: string[];
  styles?: string[];
  cipher?: { salt: string; iv: string; data: string };
  passwordHint?: string;
  minutes: number;
  words?: number;
  hideHomeContent?: boolean;
}
export interface NavigationLink {
  name?: string;
  label: string;
  url?: string;
  icon?: string;
  external?: boolean;
  children?: NavigationLink[];
}
export interface Site {
  displaySettings: {
    colorStyle: boolean;
    colorSpec: boolean;
    wallpaperMode: boolean;
    layoutMode: boolean;
    texture: boolean;
    reduceMotion: boolean;
  };
  wallpaperMode: string;
  bannerMobile: string;
  bannerOptions: {
    dim: { enable: boolean; opacity: number };
    waves: { enable: boolean };
    homeText: {
      enable: boolean;
      title: string;
      subtitle: string[];
      typewriter: {
        enable: boolean;
        speed: number;
        deleteSpeed: number;
        pauseTime: number;
        loop: boolean;
      };
    };
    position: string;
  };
  profileName: string;
  profileLinks: { name: string; url: string; icon: string }[];
  texture: { enable: boolean; defaultPreset: string; defaultOpacity: number };
  today: string;
  themeColor: {
    hue: number;
    style:
      | "tonalSpot"
      | "vibrant"
      | "content"
      | "expressive"
      | "rainbow"
      | "fruitSalad"
      | "monochrome"
      | "neutral"
      | "fidelity";
    spec: "2021" | "2025";
    fixed: boolean;
  };
  layout: { mode: string; cover: string; cardWidth: string };

  widgets: {
    type: string;
    enable: boolean;
    column?: string;
    pages?: string[];
    collapseAfter?: number;
  }[];
  arrangement: string;
  sidebarEnabled: boolean;
  announcement: {
    content: string;
    link?: { enable: boolean; text: string; url: string };
  };
  taxonomy: Record<
    string,
    { id: string; title: string; url: string; count: number }[]
  >;
  stats: {
    posts: number;
    words: number;
    dates: string[];
    moments: number;
    categories: number;
    tags: number;
    series: number;
    days: number;
    updated: string;
  };
  contextMenu: boolean;
  music?: { tracks: any[]; volume: number };
  comments?: any;
  analytics?: any;

  title: string;
  subtitle: string;
  url: string;
  lang: string;
  avatar: string;
  bio: string;
  banner: string;
  links: NavigationLink[];
  pages: string[];
}
export interface PageData {
  kind: string;
  title: string;
  posts: Post[];
  items: import("../schemas/content").Entity[];
  post?: Post;
  html?: string;
  page: number;
  pages: number;
  total: number;
  redirect?: string;
}
