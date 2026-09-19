import type { McStyle, McSpec } from "~/utils/mc-utils";
import type { Site } from "#shared/types/content";
export function useTheme(listenToSystem = false) {
  const { data: site } = useNuxtData<Site>("site");
  const ready = useState("theme:ready", () => false),
    dark = useState("dark", () => false),
    mode = useState<"light" | "dark" | "auto">("theme:mode", () => "auto");
  const hue = useState("hue", () => site.value?.themeColor.hue ?? 315),
    style = useState<McStyle>(
      "color-style",
      () => site.value?.themeColor.style || "tonalSpot",
    ),
    spec = useState<McSpec>(
      "color-spec",
      () => site.value?.themeColor.spec || "2025",
    );
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
      localStorage.setItem("shirone:theme", mode.value);
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
  async function setMode(value: "light" | "dark" | "auto") {
    mode.value = value;
    dark.value =
      value === "dark" ||
      (value === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark.value);
    persist();
    await apply();
  }
  async function toggle() {
    await setMode(dark.value ? "light" : "dark");
  }
  async function update() {
    persist();
    await apply();
  }
  let query: MediaQueryList | undefined;
  function systemChanged() {
    if (mode.value === "auto") void setMode("auto");
  }
  onMounted(async () => {
    if (listenToSystem) {
      query = matchMedia("(prefers-color-scheme: dark)");
      query.addEventListener("change", systemChanged);
    }
    if (ready.value) return;
    try {
      const stored = localStorage.getItem("shirone:theme");
      if (stored === "light" || stored === "dark" || stored === "auto")
        mode.value = stored;
      const saved = JSON.parse(
        localStorage.getItem("shirone:palette") || "null",
      );
      if (saved && Number.isFinite(saved.hue)) {
        hue.value = Math.max(0, Math.min(360, saved.hue));
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
    await setMode(mode.value);
    ready.value = true;
  });
  onBeforeUnmount(() => query?.removeEventListener("change", systemChanged));
  return { ready, dark, mode, hue, style, spec, update, toggle, setMode };
}
