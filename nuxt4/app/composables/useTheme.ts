import type { McStyle, McSpec } from "~/utils/mc-utils";
export function useTheme() {
  const ready = ref(false),
    dark = useState("dark", () => false),
    hue = useState("hue", () => 315),
    style = useState<McStyle>("color-style", () => "tonalSpot"),
    spec = useState<McSpec>("color-spec", () => "2025");
  async function apply() {
    const { resolveScheme } = await import("~/utils/mc-utils");
    for (const [role, value] of Object.entries(
      resolveScheme(hue.value, dark.value, style.value, spec.value),
    )) {
      if (value) {
        const name = role.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
        document.documentElement.style.setProperty("--" + name, value);
        document.documentElement.style.setProperty("--mc-" + name, value);
      }
    }
  }
  function persist() {
    try {
      localStorage.setItem("shirone:theme", dark.value ? "dark" : "light");
      localStorage.setItem(
        "shirone:palette",
        JSON.stringify({
          hue: hue.value,
          style: style.value,
          spec: spec.value,
        }),
      );
    } catch {}
  }
  async function toggle() {
    dark.value = !dark.value;
    document.documentElement.classList.toggle("dark", dark.value);
    persist();
    await apply();
  }
  async function update() {
    persist();
    await apply();
  }
  onMounted(async () => {
    try {
      dark.value = localStorage.getItem("shirone:theme") === "dark";
      const saved = JSON.parse(
        localStorage.getItem("shirone:palette") || "null",
      );
      if (saved && Number.isFinite(saved.hue)) {
        hue.value = saved.hue;
        if (
          [
            "tonalSpot",
            "vibrant",
            "content",
            "expressive",
            "rainbow",
            "fruitSalad",
            "monochrome",
            "neutral",
            "fidelity",
          ].includes(saved.style)
        )
          style.value = saved.style;
        if (["2021", "2025"].includes(saved.spec)) spec.value = saved.spec;
      }
    } catch {}
    document.documentElement.classList.toggle("dark", dark.value);
    ready.value = true;
    await apply();
  });
  return { dark, toggle, ready, hue, style, spec, update };
}
