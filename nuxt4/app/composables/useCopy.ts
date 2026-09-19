import { getTranslation } from "~/i18n/translation";
export function useCopy() {
  const locale = useState("locale", () => "en");
  return {
    locale,
    t: (key: string) => {
      key = key === "music" ? "musicPlayerTitle" : key;
      return (
        (getTranslation(locale.value) as Record<string, string>)[key] || key
      );
    },
  };
}
