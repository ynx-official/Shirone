export default defineEventHandler(async (event) => {
  if (!useRuntimeConfig(event).public.mockAdmin)
    throw createError({ statusCode: 404 });
  const id = String(getQuery(event).id || "");
  const registry =
    await useStorage("assets:content").getItem<Record<string, string>>(
      "includes.json",
    );
  if (!registry || !Object.hasOwn(registry, id))
    throw createError({ statusCode: 404 });
  setHeader(event, "Cache-Control", "no-store");
  return { source: registry[id] };
});
