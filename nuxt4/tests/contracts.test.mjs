import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
await fs.mkdir(".cache/tests", { recursive: true });
await build({
  entryPoints: ["app/repositories/admin.ts"],
  outfile: ".cache/tests/admin.mjs",
  bundle: true,
  tsconfigRaw: {},
  platform: "node",
  format: "esm",
  packages: "external",
  alias: { "#shared": fileURLToPath(new URL("../shared", import.meta.url)) },
});
const { validateSnapshot, createAdminRepository, references, STORAGE_KEY } =
  await import("../.cache/tests/admin.mjs");
const seed = JSON.parse(await fs.readFile(".generated/admin.json", "utf8"));
const db = JSON.parse(await fs.readFile(".generated/public.json", "utf8"));
test("public payload excludes drafts and encrypted plaintext", () => {
  assert(!db.posts.some((p) => p.id === "draft"));
  const protectedPost = db.posts.find((p) => p.protected);
  assert(protectedPost?.cipher);
  assert.equal(protectedPost.html, undefined);
  assert.equal(protectedPost.body, undefined);
  assert.equal(protectedPost.password, undefined);
  assert(
    !JSON.stringify(db).includes(
      "恭喜！你已成功解锁",
    ),
  );
});
test("all post routes uniquely resolve to canonical paths", () => {
  assert.equal(new Set(db.posts.map((p) => p.url)).size, db.posts.length);
  for (const post of db.posts) assert.equal(db.paths[post.url], post.url);
});
test("seed validates; malformed import and duplicate IDs rejected", () => {
  validateSnapshot(seed);
  assert.throws(() => validateSnapshot({ version: 2, collections: {} }));
  const copy = structuredClone(seed);
  copy.collections.posts.push(copy.collections.posts[0]);
  assert.throws(() => validateSnapshot(copy));
  const secret = structuredClone(seed);
  secret.collections.settings[0].data.password = "do-not-store";
  assert.throws(() => validateSnapshot(secret));
});
test("local repository reloads saved edits without mutating source", async () => {
  const values = new Map();
  const storage = {
    getItem: (k) => values.get(k) || null,
    setItem: (k, v) => values.set(k, v),
    removeItem: (k) => values.delete(k),
  };
  const repository = createAdminRepository(storage, async () =>
    structuredClone(seed),
  );
  const data = await repository.load();
  data.collections.posts[0].title = "Local edited title";
  await repository.save(data);
  assert.equal(
    (await repository.load()).collections.posts[0].title,
    "Local edited title",
  );
  assert.notEqual(seed.collections.posts[0].title, "Local edited title");
  assert(values.has(STORAGE_KEY));
  await repository.reset();
  assert(!values.has(STORAGE_KEY));
});
test("storage failures propagate instead of reporting successful saves", async () => {
  const repo = createAdminRepository(
    {
      getItem: () => null,
      setItem: () => {
        throw Error("quota");
      },
      removeItem: () => {},
    },
    async () => seed,
  );
  await assert.rejects(() => repo.save(seed), /quota/);
});
test("referenced taxonomy cannot be silently removed", () => {
  const category = seed.collections.categories.find((e) =>
    seed.collections.posts.some((p) => p.category === e.title),
  );
  assert(references(seed, "categories", category).length > 0);
});
test("article HTML contains real headings, ordinary and extended content", () => {
  assert(db.posts.some((p) => p.html?.includes("<h2")));
  assert(db.posts.some((p) => p.syntaxes?.includes("admonition")));
  assert(db.posts.some((p) => p.syntaxes?.includes("math")));
});
test("public album directory contains no password-bearing metadata", async () => {
  const files = await fs.readdir("public/images/albums", { recursive: true });
  assert(!files.some((p) => String(p).endsWith("info.json")));
});
