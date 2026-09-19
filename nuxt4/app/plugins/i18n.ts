import { normalizeLocale } from "~/i18n/locales";

export default defineNuxtPlugin(async () => {
  const repository = usePublicRepository();
  const { data: site } = await useAsyncData("site", repository.site);
  const saved = useCookie<string | undefined>("shirone-locale");
  const locale =
    normalizeLocale(saved.value) ||
    normalizeLocale(site.value?.lang) ||
    "zh_CN";
  const { data, error } = await useAsyncData("translations", () =>
    $fetch("/api/i18n", { query: { lang: locale } }),
  );
  if (error.value) throw error.value;
  // Only the active dictionary enters the SSR payload; hydration reuses it.
  useState("locale", () => data.value!.locale);
});
