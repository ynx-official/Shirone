import { database } from "../services/content";
import { xml } from "../utils/xml";
export default defineEventHandler(async (event) => {
  const db = await database();
  setHeader(event, "Content-Type", "application/atom+xml; charset=utf-8");
  return `<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${xml(db.site.title)}</title><id>${xml(db.site.url)}</id><updated>${db.posts[0]?.published || "2026-01-01T00:00:00.000Z"}</updated><link href="${xml(db.site.url)}"/>${db.posts
    .filter((p) => !p.protected)
    .map(
      (p) =>
        `<entry><title>${xml(p.title)}</title><id>${xml(new URL(p.url, db.site.url).href)}</id><link href="${xml(new URL(p.url, db.site.url).href)}"/><updated>${p.published}</updated><summary>${xml(p.description)}</summary></entry>`,
    )
    .join("")}</feed>`;
});
