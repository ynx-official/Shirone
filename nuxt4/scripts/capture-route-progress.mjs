import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const original = process.argv[2] === "original";
const name = original ? "original" : "nuxt";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
});
await page.goto(
  original
    ? "http://localhost:4321/"
    : process.env.NUXT_COMPARE_URL || "http://127.0.0.1:4322/",
);
if (!original)
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
let release;
const gate = new Promise((resolve) => (release = resolve));
await page.route(
  original ? "**/archive/" : "**/api/mock/page?**",
  async (route) => {
    await gate;
    await route.continue();
  },
);
await page
  .locator(
    original
      ? '.top-app-bar__nav a[href="/archive/"]'
      : '.desktop-navigation a[href="/archive/"]',
  )
  .click();
const bar = page.locator(".route-progress");
await expect(bar).toHaveCSS("opacity", "1");
await page.waitForTimeout(450);
await mkdir("docs/comparison/route-progress", { recursive: true });
await page.screenshot({
  path: `docs/comparison/route-progress/${name}-banner.png`,
  clip: { x: 0, y: 0, width: 1440, height: 100 },
});
await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
await expect(bar).toHaveCSS("top", "64px");
await page.waitForTimeout(450);
await page.screenshot({
  path: `docs/comparison/route-progress/${name}-scrolled.png`,
  clip: { x: 0, y: 0, width: 1440, height: 100 },
});
await writeFile(
  `docs/comparison/route-progress/${name}.json`,
  JSON.stringify(
    await bar.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        height: s.height,
        top: s.top,
        opacity: s.opacity,
        zIndex: s.zIndex,
        pointerEvents: s.pointerEvents,
      };
    }),
    null,
    2,
  ),
);
release();
await expect(bar).toHaveCSS("opacity", "0");
await browser.close();
