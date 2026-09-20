// Adapted from the Astro font integration; all inputs belong to this Nuxt app.
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import subsetFont from "subset-font";
import fontverter from "fontverter";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const defaults = {
  maxFamilyBytes: 4 * 1024 ** 2,
  maxTotalBytes: 6 * 1024 ** 2,
};

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(async (entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? files(path) : [path];
      }),
    )
  ).flat();
}

export async function collectFontText(root, options = {}) {
  const characters = new Set();
  const absorb = (text) => {
    for (const character of text) {
      if (character.codePointAt(0) > 31) characters.add(character);
    }
  };
  if (options.includeCommon !== false) {
    for (let code = 32; code <= 126; code++) absorb(String.fromCodePoint(code));
    absorb("，。！？；：、（）【】《》「」『』‘’“”…—·©→←↑↓");
  }
  const sources = [
    ...(options.includeContent !== false ? ["content"] : []),
    ...(options.includeI18n !== false ? ["app/i18n"] : []),
    ...(options.includeConfig !== false ? ["mock"] : []),
  ];
  for (const directory of sources) {
    for (const file of await files(join(root, directory))) {
      if (!/\.(md|mdx|ts|json)$/.test(file)) continue;
      const text = await readFile(file, "utf8");
      // Include decoded JSON escapes and escaped Unicode in translation sources.
      if (file.endsWith(".json")) absorb(JSON.stringify(JSON.parse(text)));
      else
        absorb(
          text.replace(
            /\\u\{([\da-f]+)\}|\\u([\da-f]{4})/gi,
            (_, braced, plain) =>
              String.fromCodePoint(parseInt(braced || plain, 16)),
          ),
        );
    }
  }
  return [...characters].sort().join("");
}

export async function prepareFonts({ dev = false, root = appRoot } = {}) {
  const config = JSON.parse(
    await readFile(join(root, "mock/public/config.json"), "utf8"),
  ).font;
  // Separate directories allow a running dev server and a production build to coexist.
  const output = join(
    root,
    ".generated",
    dev ? "fonts-dev" : "fonts-production",
  );
  await mkdir(output, { recursive: true });
  if (config?.mode === "system") {
    await rm(output, { recursive: true, force: true });
    await mkdir(output, { recursive: true });
    await writeFile(
      join(output, "font.css"),
      "html:root{--font-sans:system-ui,sans-serif}\n",
    );
    return output;
  }
  const source = await readFile(join(root, "assets/fonts/Yozai-Medium.ttf"));
  const charset =
    dev || config?.subsetting?.enable === false
      ? ""
      : await collectFontText(root, config?.subsetting);
  if (!dev && config?.subsetting?.enable !== false && !charset) {
    throw new Error("[fonts] Cannot generate an empty font subset");
  }
  const hash = createHash("sha256")
    .update("yozai-v1")
    .update(source)
    .update(charset)
    .digest("hex")
    .slice(0, 16);
  const name = `Yozai-Medium.${hash}.${dev ? "ttf" : "woff2"}`;
  let buffer;
  try {
    buffer = await readFile(join(output, name));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    buffer = dev
      ? source
      : charset
        ? await subsetFont(source, charset, { targetFormat: "woff2" })
        : await fontverter.convert(source, "woff2");
  }
  if (
    !dev &&
    (buffer.length === 0 ||
      buffer.length >
        (config?.budget?.maxFamilyBytes ?? defaults.maxFamilyBytes))
  ) {
    throw new Error(
      `[fonts] Yozai exceeds the font budget (${buffer.length} bytes)`,
    );
  }
  await writeFile(join(output, name), buffer);
  // Keep the existing family, font metrics and optional fallback policy.
  await writeFile(
    join(output, "font.css"),
    `@font-face{font-family:Yozai;src:url(/fonts/yozai/${name}) format("${dev ? "truetype" : "woff2"}");font-display:optional}\n`,
  );
  for (const path of await files(output)) {
    if (path !== join(output, name) && path !== join(output, "font.css"))
      await rm(path);
  }
  console.log(
    `[fonts] Yozai: ${source.length} → ${buffer.length} bytes (${dev ? "development original" : "production WOFF2"})`,
  );
  return output;
}

export async function checkFonts(directory, budget) {
  if (!budget) {
    const config = JSON.parse(
      await readFile(join(appRoot, "mock/public/config.json"), "utf8"),
    );
    budget = config.font?.budget || defaults;
  }
  let total = 0;
  for (const file of await files(directory)) {
    // KaTeX ships its own multi-format math fonts, outside the site font budget.
    if (file.replaceAll("\\", "/").includes("/styles/katex/")) continue;
    const extension = extname(file).toLowerCase();
    if ([".ttf", ".otf"].includes(extension))
      throw new Error(`[fonts] Raw font in production: ${file}`);
    if ([".css", ".html"].includes(extension)) {
      const text = await readFile(file, "utf8");
      if (
        /url\(\s*["']?[^)\s"']+\.(?:ttf|otf)(?:[?#][^)"']*)?["']?\s*\)/i.test(
          text,
        )
      ) {
        throw new Error(`[fonts] Raw font reference in production: ${file}`);
      }
    }
    if (![".woff", ".woff2"].includes(extension)) continue;
    const buffer = await readFile(file);
    if (
      !buffer.length ||
      buffer.length > (budget.maxFamilyBytes ?? defaults.maxFamilyBytes)
    ) {
      throw new Error(`[fonts] Font exceeds per-file budget: ${file}`);
    }
    if (extension === ".woff2" && buffer.toString("ascii", 0, 4) !== "wOF2") {
      throw new Error(`[fonts] Invalid WOFF2: ${file}`);
    }
    total += buffer.length;
  }
  if (total > (budget.maxTotalBytes ?? defaults.maxTotalBytes))
    throw new Error(`[fonts] Total font budget exceeded: ${total} bytes`);
  console.log(
    `[fonts] Production check passed (${total} font bytes; no raw site fonts)`,
  );
}
