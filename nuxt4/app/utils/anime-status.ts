import type { AnimeStatus } from "#shared/types/discovery";
export const animeStatus: Record<
  AnimeStatus,
  { key: string; icon: string; color: string }
> = {
  watching: {
    key: "animeStatusWatching",
    icon: "material-symbols:play-arrow-rounded",
    color: "var(--primary)",
  },
  completed: {
    key: "animeStatusCompleted",
    icon: "material-symbols:check-rounded",
    color: "var(--tertiary)",
  },
  planned: {
    key: "animeStatusPlanned",
    icon: "material-symbols:bookmark-outline-rounded",
    color: "var(--secondary)",
  },
  onHold: {
    key: "animeStatusOnHold",
    icon: "material-symbols:pause-rounded",
    color: "var(--on-surface-variant)",
  },
  dropped: {
    key: "animeStatusDropped",
    icon: "material-symbols:close-rounded",
    color: "var(--error)",
  },
};
