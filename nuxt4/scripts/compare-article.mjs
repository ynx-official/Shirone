import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const phase = process.argv[2] || "before";
const sites =
  phase === "after"
    ? [["after", 4322]]
    : [
        ["original", 4321],
        ["before", 4322],
      ];
const output = `.cache/article-comparison/${phase}`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = {};
try {
  for (const [site, port] of sites) {
    for (const [size, viewport] of [
      ["desktop", { width: 1440, height: 1000 }],
      ["mobile", { width: 390, height: 844 }],
    ]) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      for (const slug of ["markdown", "expressive-code", "markdown-extended"]) {
        const key = `${site}-${size}-${slug}`;
        await page.goto(`http://localhost:${port}/posts/${slug}/`, {
          waitUntil: "networkidle",
          timeout: 90000,
        });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(600);
        const selector =
          site === "original" ? "#main-content-column" : "main#main";
        const top = await page
          .locator(selector)
          .evaluate((el) => el.getBoundingClientRect().top + scrollY);
        await page.evaluate((y) => scrollTo(0, y - 80), top);
        await page.screenshot({ path: `${output}/${key}.png` });
        results[key] = await page.evaluate(() => {
          const pick = (selector) =>
            [...document.querySelectorAll(selector)].slice(0, 6).map((el) => {
              const s = getComputedStyle(el),
                r = el.getBoundingClientRect();
              return {
                text: el.textContent?.trim().slice(0, 65),
                x: r.x,
                width: r.width,
                height: r.height,
                fontSize: s.fontSize,
                lineHeight: s.lineHeight,
                padding: s.padding,
                margin: s.margin,
                background: s.backgroundColor,
              };
            });
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            headings: pick("main h1, main h2"),
            paragraphs: pick("main .prose p"),
            code: pick("main pre"),
            cover: pick("#post-cover, .article-cover"),
            tables: pick("main table"),
          };
        });
        await page.evaluate(() =>
          scrollTo(0, document.documentElement.scrollHeight),
        );
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${output}/${key}-bottom.png` });
        console.log(key, JSON.stringify(results[key]));
      }
      await page.close();
    }
  }
  await writeFile(
    `${output}/measurements.json`,
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
