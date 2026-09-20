export interface MomentImage {
  src: string;
  thumbnail?: string;
  srcset?: string;
  alt?: string;
  width?: number;
  height?: number;
}
export interface MomentData {
  published?: string;
  pinned?: boolean;
  mood?: string;
  location?: string;
  html?: string;
  images?: MomentImage[];
}
export interface MomentAuthor {
  name: string;
  avatar: string;
  avatarSrcset?: string;
  url: string;
}
