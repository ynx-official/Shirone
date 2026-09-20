import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const output = "docs/comparison/discovery";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const metrics = {};
const hidden =
  ".topbar,#navbar,#floating-controls,.floating-controls,astro-dev-toolbar{display:none!important}";
for (const [site, origin] of [
  ["original", "http://127.0.0.1:4321"],
  ["nuxt", process.env.DISCOVERY_COMPARE_URL || "http://localhost:4322"],
]) {
  for (const route of ["anime", "compass"])
    for (const [size, viewport] of [
      ["desktop", { width: 1440, height: 1000 }],
      ["mobile", { width: 390, height: 844 }],
    ]) {
      const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${origin}/${route}/`);
      for (const mode of ["light", "dark"]) {
        await page.evaluate((value) => {
          localStorage.setItem("theme", value);
          localStorage.setItem("shirone:theme", value);
          localStorage.removeItem("shirone:anime-layout-mode");
        }, mode);
        await page.reload();
        const section = page.locator(`.${route}-section`);
        await section.scrollIntoViewIfNeeded();
        await page.waitForFunction(() =>
          getComputedStyle(document.documentElement)
            .getPropertyValue("--mc-primary")
            .trim(),
        );
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(650);
        await section.screenshot({
          path: `${output}/${site}-${route}-${size}-${mode}.png`,
          style: hidden,
        });
        if (mode === "light")
          metrics[`${site}-${route}-${size}`] = await section.evaluate((el) => {
            const card = el.querySelector(".anime-card,.compass-tile"),
              cover = el.querySelector(".anime-card__cover");
            const rect = (e) => {
              const r = e.getBoundingClientRect();
              return { width: r.width, height: r.height };
            };
            return {
              section: rect(el),
              padding: getComputedStyle(el).padding,
              card: rect(card),
              cover: cover ? rect(cover) : undefined,
              count: el.querySelectorAll(".anime-card,.compass-tile").length,
              overflow: document.documentElement.scrollWidth > innerWidth,
            };
          });
        if (route === "anime") {
          await page.locator(".anime-section__layout-btn").nth(1).click();
          await page.waitForTimeout(100);
          await section.screenshot({
            path: `${output}/${site}-${route}-${size}-${mode}-list.png`,
            style: hidden,
          });
        }
      }
      metrics[`${site}-${route}-${size}`].errors = errors;
      await page.close();
    }
}
await writeFile(
  `${output}/measurements.json`,
  JSON.stringify(metrics, null, 2),
);
await browser.close();
