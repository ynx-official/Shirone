import { database } from "../services/content";
import { xml } from "../utils/xml";
export default defineEventHandler(async (event) => {
  const db = await database();
  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  const urls = [
    "/",
    ...db.site.pages.map((p) => `/${p}/`),
    ...db.posts.filter((p) => !p.protected).map((p) => p.url),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((p) => `<url><loc>${xml(new URL(p, db.site.url).href)}</loc></url>`).join("")}</urlset>`;
});
