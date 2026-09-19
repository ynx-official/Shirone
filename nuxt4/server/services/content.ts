import type { Entity } from "#shared/schemas/content";
import type { Post, Site, PageData } from "#shared/types/content";
interface Database {
  site: Site;
  posts: Post[];
  paths: Record<string, string>;
  collections: Record<string, Entity[]>;
  spec: Record<string, string>;
}
export async function database(): Promise<Database> {
  const value =
    await useStorage("assets:content").getItem<Database>("public.json");
  if (!value)
    throw createError({
      statusCode: 503,
      statusMessage: "Content unavailable",
    });
  return value;
}
export const summary = (p: Post): Post => {
  const {
    html: _h,
    toc: _t,
    syntaxes: _s,
    styles: _st,
    cipher: _c,
    ...rest
  } = p;
  return rest;
};
export async function pageData(
  path: string,
  query: Record<string, unknown>,
): Promise<PageData> {
  const db = await database();
  const normalized = "/" + path.replace(/^\/+|\/+$/g, "") + "/";
  const segments = path.split("/").filter(Boolean);
  const kind = segments[0] || "home";
  const base: PageData = {
    kind,
    title: kind,
    posts: [],
    items: [],
    page: 1,
    pages: 1,
    total: 0,
  };
  if (
    (db.collections[kind] || kind === "about") &&
    !db.site.pages.includes(kind)
  )
    throw createError({ statusCode: 404 });
  if (db.paths[normalized]) {
    const url = db.paths[normalized]!;
    if (url !== normalized) return { ...base, redirect: url };
    const post = db.posts.find((p) => p.url === url)!;
    return { ...base, kind: "post", title: post.title, post };
  }
  if (
    kind === "home" ||
    /^\d+$/.test(kind) ||
    ["archive", "search", "tags", "categories"].includes(kind) ||
    kind === "series"
  ) {
    let posts = db.posts;
    if (query.date)
      posts = posts.filter((p) => p.published.startsWith(String(query.date)));
    if (query.tag)
      posts = posts.filter((p) => p.tags.includes(String(query.tag)));
    if (query.category)
      posts = posts.filter((p) => p.category === String(query.category));
    if (query.uncategorized === "true")
      posts = posts.filter((p) => !p.category);
    if (query.q) {
      const q = String(query.q).toLowerCase();
      posts = posts.filter((p) =>
        (p.title + " " + p.description).toLowerCase().includes(q),
      );
    }
    if (kind === "series" && segments[1]) {
      const series = db.collections.series?.find((e) => e.id === segments[1]);
      if (!series) throw createError({ statusCode: 404 });
      posts = posts.filter((p) => p.series === segments[1]);
      base.title = series.title;
    }
    const page = Number(query.page || (/^\d+$/.test(kind) ? kind : 1)),
      pages = Math.max(1, Math.ceil(posts.length / 8));
    if (!Number.isInteger(page) || page < 1 || page > pages)
      throw createError({ statusCode: 404 });
    return {
      ...base,
      kind: /^\d+$/.test(kind) ? "home" : kind,
      posts: (kind === "archive"
        ? posts
        : posts.slice((page - 1) * 8, page * 8)
      ).map(summary),
      items: db.collections[kind] || [],
      page,
      pages: kind === "archive" ? 1 : pages,
      total: posts.length,
    };
  }
  if (kind === "about") return { ...base, html: db.spec.about || "" };
  if (["rss", "atom"].includes(kind)) return base;
  if (db.collections[kind]) {
    if (segments.length > 2 || (segments[1] && kind !== "albums"))
      throw createError({ statusCode: 404 });
    let items = segments[1]
      ? db.collections[kind]!.filter(
          (e) => e.id === decodeURIComponent(segments[1]!),
        )
      : db.collections[kind]!;
    if (segments[1] && !items.length) throw createError({ statusCode: 404 });
    if (query.q)
      items = items.filter((e) =>
        (e.title + " " + e.description)
          .toLowerCase()
          .includes(String(query.q).toLowerCase()),
      );
    if (query.category)
      items = items.filter((e) => e.category === query.category);
    if (query.status)
      items = items.filter((e) => e.data.status === query.status);
    return {
      ...base,
      items,
      total: items.length,
      title: segments[1] ? items[0]!.title : kind,
    };
  }
  throw createError({ statusCode: 404, statusMessage: "Page not found" });
}
