import { normalizeLocale } from "~/i18n/locales";
import type { Translation } from "~/i18n/translation";
import type { Locale } from "~/i18n/locales";
export function useCopy() {
  const { data } = useNuxtData<{
    locale: Locale;
    messages: Translation;
    options: { value: Locale; lang: string; label: string }[];
  }>("translations");
  const requestId = useState("locale:request", () => 0);
  const saved = useCookie<string | undefined>("shirone-locale", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  const state = useState(
    "locale",
    () => normalizeLocale(saved.value) || "zh_CN",
  );
  const locale = computed({
    get: () => state.value,
    set: (value: string) => {
      const next = normalizeLocale(value);
      if (!next) return;
      const id = ++requestId.value;
      void $fetch("/api/i18n", { query: { lang: next } })
        .then((result) => {
          if (id !== requestId.value) return;
          data.value = result;
          state.value = next;
          saved.value = next;
        })
        .catch(console.error);
    },
  });
  return {
    locale,
    localeOptions: computed(() => data.value?.options || []),
    t: (key: string) => {
      key = key === "music" ? "musicPlayerTitle" : key;
      return (
        (data.value?.messages as Record<string, string> | undefined)?.[key] ||
        key
      );
    },
  };
}
