import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

test("browser Markdown compiler bundles dependencies with native filesystem paths", async () => {
  const result = spawnSync(process.execPath, ["scripts/build-preview.mjs"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    encoding: "utf8",
    timeout: 60000,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const output = await readFile(
    new URL("../public/preview/compiler.js", import.meta.url),
    "utf8",
  );
  assert.ok(output.length > 0);
  assert.doesNotMatch(output, /from\s*["']node:(?:fs|path)["']/);
});

test("content build preserves portable article URLs and snippet keys", async () => {
  const result = spawnSync(process.execPath, ["scripts/build-content.mjs"], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    encoding: "utf8",
    timeout: 120000,
  });
  assert.equal(result.status, 0, result.stderr || String(result.error));
  const db = JSON.parse(
    await readFile(
      new URL("../.generated/public.json", import.meta.url),
      "utf8",
    ),
  );
  assert.ok(db.posts.length > 0);
  for (const post of db.posts) {
    assert.ok(!post.id.includes("\\"), post.id);
    assert.ok(!post.url.includes("\\"), post.url);
  }
  const includes = JSON.parse(
    await readFile(
      new URL("../.generated/includes.json", import.meta.url),
      "utf8",
    ),
  );
  assert.ok(Object.keys(includes).length > 0);
  for (const key of Object.keys(includes))
    assert.ok(key.startsWith("content/snippets/"), key);
});
