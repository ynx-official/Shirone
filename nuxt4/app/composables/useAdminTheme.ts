import { theme as antTheme } from "antdv-next";

/** Admin appearance is intentionally independent from the public blog palette. */
export function useAdminTheme() {
  const mode = useState<"light" | "dark">("admin-appearance", () => "light");
  onMounted(() => {
    try {
      mode.value =
        localStorage.getItem("shirone:admin:appearance") === "dark"
          ? "dark"
          : "light";
    } catch {
      /* Storage may be unavailable in private contexts. */
    }
  });
  function setMode(value: "light" | "dark") {
    mode.value = value;
    try {
      localStorage.setItem("shirone:admin:appearance", value);
    } catch {
      /* Keep the session setting when persistence is unavailable. */
    }
  }
  const theme = computed(() => {
    const dark = mode.value === "dark";
    return {
      algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      token: {
        colorPrimary: dark ? "#e5e5e5" : "#262626",
        colorInfo: dark ? "#e5e5e5" : "#262626",
        colorText: dark ? "#ededed" : "#242424",
        colorTextSecondary: dark ? "#a8a8a8" : "#666666",
        colorTextDescription: dark ? "#a8a8a8" : "#666666",
        colorTextTertiary: dark ? "#a8a8a8" : "#666666",
        colorBgContainer: dark ? "#202020" : "#ffffff",
        colorBgElevated: dark ? "#282828" : "#ffffff",
        colorBgLayout: dark ? "#171717" : "#f7f7f7",
        colorBorder: dark ? "#444444" : "#d9d9d9",
        colorBorderSecondary: dark ? "#333333" : "#e8e8e8",
        colorTextLightSolid: dark ? "#171717" : "#ffffff",
        borderRadius: 6,
        controlHeight: 36,
        fontSize: 13,
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif',
      },
      components: {
        Button: {
          primaryColor: dark ? "#171717" : "#ffffff",
          primaryShadow: "none",
        },
        Table: {
          headerBg: dark ? "#252525" : "#fafafa",
          cellPaddingBlockSM: 14,
        },
      },
    };
  });
  return { theme, mode, setMode };
}
