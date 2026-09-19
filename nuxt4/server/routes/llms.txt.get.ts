import { database } from "../services/content";
export default defineEventHandler(async (event) => {
  const db = await database();
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return `# ${db.site.title}\n\n${db.posts
    .filter((p) => !p.protected)
    .map(
      (p) => `- [${p.title}](${new URL(p.url, db.site.url)}): ${p.description}`,
    )
    .join("\n")}`;
});
