export default defineEventHandler(async (event) => {
  if (!useRuntimeConfig(event).public.mockAdmin)
    throw createError({ statusCode: 404 });
  setHeader(event, "Cache-Control", "no-store");
  return useStorage("assets:content").getItem("admin.json");
});
