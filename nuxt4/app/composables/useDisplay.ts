import type { Site } from "#shared/types/content";
export function useDisplay() {
  const { data: site } = useNuxtData<Site>("site");
  const wallpaper = useState(
    "display:wallpaper",
    () => site.value?.wallpaperMode || "banner",
  );
  const layout = useState(
    "display:layout",
    () => site.value?.layout.mode || "list",
  );
  const texture = useState(
    "display:texture",
    () => site.value?.texture.defaultPreset || "starlight",
  );
  const reduced = useState("display:reduced", () => false);
  function persist() {
    try {
      localStorage.setItem(
        "shirone:display",
        JSON.stringify({
          wallpaper: wallpaper.value,
          layout: layout.value,
          texture: texture.value,
          reduced: reduced.value,
        }),
      );
    } catch {}
  }
  return { wallpaper, layout, texture, reduced, persist };
}
