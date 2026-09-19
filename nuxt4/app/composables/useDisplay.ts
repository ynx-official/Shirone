export function useDisplay() {
  const wallpaper = useState("display:wallpaper", () => "banner");
  const layout = useState("display:layout", () => "list");
  const texture = useState("display:texture", () => "starlight");
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
