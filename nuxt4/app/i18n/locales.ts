export const supportedLocales = [
  "en",
  "zh_CN",
  "zh_TW",
  "ja",
  "es",
  "id",
  "ko",
  "th",
  "tr",
  "vi",
] as const;
export type Locale = (typeof supportedLocales)[number];
export function normalizeLocale(value: unknown): Locale | undefined {
  if (typeof value !== "string") return;
  const normalized = value.toLowerCase().replace(/-/g, "_");
  const exact = supportedLocales.find(
    (code) => code.toLowerCase() === normalized,
  );
  if (exact) return exact;
  if (normalized === "zh_hans" || normalized === "zh") return "zh_CN";
  if (normalized === "zh_hant") return "zh_TW";
  return supportedLocales.find((code) => code === normalized.split("_")[0]);
}
