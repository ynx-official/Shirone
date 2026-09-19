import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const db = JSON.parse(await fs.readFile(".generated/public.json", "utf8"));
const admin = JSON.parse(await fs.readFile(".generated/admin.json", "utf8"));
const han = /[\u3400-\u9fff]/;
test("Chinese mock metadata and admin seeds cover every content domain", () => {
  assert.equal(db.site.lang, "zh_CN");
  assert(han.test(db.site.subtitle));
  assert(han.test(db.site.bio));
  assert(
    db.site.bannerOptions.homeText.subtitle.every((text) => han.test(text)),
  );
  for (const post of db.posts) {
    assert(han.test(post.title), post.id);
    assert(han.test(post.description), post.id);
    assert.equal(db.paths[post.url], post.url);
  }
  for (const domain of [
    "moments",
    "albums",
    "friends",
    "compass",
    "anime",
    "projects",
    "skills",
    "devices",
    "games",
    "timeline",
  ]) {
    assert(db.collections[domain].length, domain);
    for (const item of db.collections[domain])
      assert(han.test(item.description), domain + ":" + item.id);
  }
  for (const item of admin.collections.settings)
    assert(han.test(item.title), item.id);
  assert(!JSON.stringify(db).includes("恭喜！你已成功解锁"));
});
test("Chinese image captions retain local assets and legacy taxonomy links", async () => {
  const gallery = db.posts.find((p) => p.id === "image-grid-demo");
  assert(gallery.html.includes('class="image-grid"'));
  assert(!/src="\.\//.test(gallery.html));
  for (const [, src] of gallery.html.matchAll(
    /src="(\/content-assets\/[^"?]+)"/g,
  ))
    await fs.access("public" + src);
  assert.equal(db.taxonomyAliases.categories.Guides, "指南");
  assert.equal(db.taxonomyAliases.tags.Demo, "示例");
  const includes = db.posts.find((p) => p.id === "markdown-includes");
  assert(includes.html.includes("你好"));
});
