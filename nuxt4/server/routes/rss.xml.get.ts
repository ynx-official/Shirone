import { database } from "../services/content";
import { xml } from "../utils/xml";
export default defineEventHandler(async (event) => {
  const db = await database();
  setHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(db.site.title)}</title><link>${xml(db.site.url)}</link><description>${xml(db.site.subtitle)}</description>${db.posts
    .filter((p) => !p.protected)
    .map(
      (p) =>
        `<item><title>${xml(p.title)}</title><link>${xml(new URL(p.url, db.site.url).href)}</link><guid>${xml(new URL(p.url, db.site.url).href)}</guid><pubDate>${new Date(p.published).toUTCString()}</pubDate><description>${xml(p.description)}</description></item>`,
    )
    .join("")}</channel></rss>`;
});
