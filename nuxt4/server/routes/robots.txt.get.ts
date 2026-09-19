import { database } from "../services/content";
export default defineEventHandler(async (event) => {
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/mock/admin\nSitemap: ${new URL("/sitemap.xml", (await database()).site.url)}\n`;
});
