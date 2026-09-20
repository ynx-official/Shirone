import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  copyFile,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  collectFontText,
  prepareFonts,
  checkFonts,
} from "../scripts/fonts.mjs";

test("font build covers content, all locales and decoded data; production never ships the development TTF", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "shirone-fonts-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ["content", "app/i18n", "mock/public", "assets/fonts"])
    await mkdir(join(root, dir), { recursive: true });
  await writeFile(join(root, "content/post.md"), "字体𠮷");
  await writeFile(
    join(root, "app/i18n/ja.ts"),
    'export const label = "あ\\u8A9E";',
  );
  await writeFile(
    join(root, "mock/public/config.json"),
    '{"font":{"subsetting":{"enable":true}},"name":"\\u7AD9"}',
  );
  await copyFile(
    new URL("../assets/fonts/Yozai-Medium.ttf", import.meta.url),
    join(root, "assets/fonts/Yozai-Medium.ttf"),
  );
  const text = await collectFontText(root);
  for (const character of "字体𠮷あ語站") assert(text.includes(character));
  assert(
    !(await collectFontText(root, { includeContent: false })).includes("𠮷"),
  );
  const dev = await prepareFonts({ root, dev: true });
  const production = await prepareFonts({ root });
  assert.notEqual(dev, production);
  assert.match(await readFile(join(dev, "font.css"), "utf8"), /\.ttf/);
  const css = await readFile(join(production, "font.css"), "utf8");
  assert.match(css, /\.woff2/);
  // KaTeX owns its math fonts and is excluded on Windows as well as POSIX.
  await mkdir(join(production, "styles/katex/fonts"), { recursive: true });
  await writeFile(join(production, "styles/katex/fonts/math.ttf"), "math fixture");
  await checkFonts(production, {
    maxFamilyBytes: 100000,
    maxTotalBytes: 100000,
  });
  await writeFile(join(root, "content/post.md"), "字体𠮷新增字符");
  await prepareFonts({ root });
  assert.notEqual(await readFile(join(production, "font.css"), "utf8"), css);
  assert.match(await readFile(join(dev, "font.css"), "utf8"), /\.ttf/);
  await writeFile(
    join(production, "regression.css"),
    '@font-face{src:url("/forgotten.ttf")}',
  );
  await assert.rejects(checkFonts(production), /Raw font reference/);
  await rm(join(production, "regression.css"));
  await assert.rejects(
    checkFonts(production, { maxTotalBytes: 1 }),
    /Total font budget/,
  );
  await assert.rejects(checkFonts(dev), /Raw font/);
});
