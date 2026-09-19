import { database } from "../services/content";
export default defineEventHandler(async (event) => {
  const db = await database();
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return db.posts
    .filter((p) => !p.protected)
    .map(
      (p) =>
        `# ${p.title}\n${new URL(p.url, db.site.url)}\n\n${p.html?.replace(/<[^>]*>/g, " ")}`,
    )
    .join("\n\n");
});
