import { getTranslation } from "../../app/i18n/translation";
import { normalizeLocale, supportedLocales } from "../../app/i18n/locales";

export default defineEventHandler((event) => {
  const locale = normalizeLocale(getQuery(event).lang) || "zh_CN";
  return {
    locale,
    messages: getTranslation(locale),
    options: supportedLocales.map((value) => ({
      value,
      lang: value.replace("_", "-"),
      label: getTranslation(value).localeName,
    })),
  };
});
