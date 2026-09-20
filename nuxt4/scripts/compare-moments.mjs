import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const dir = "docs/comparison/moments";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch();
const measurements = {};
for (const [site, origin] of [
  ["original", "http://127.0.0.1:4321"],
  ["nuxt", process.env.MOMENTS_COMPARE_URL || "http://localhost:4322"],
]) {
  for (const [size, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${origin}/moments/`);
    const section = page.locator(
      site === "original" ? ".moment-section" : ".moments-section",
    );
    await section.scrollIntoViewIfNeeded();
    await page.locator(".moment-card").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    const measure = async () =>
      section.evaluate((el) => {
        const card = el.querySelector(".moment-card"),
          gallery = el.querySelector(".moment-card__gallery--mosaic");
        const rect = (element) => {
          const r = element.getBoundingClientRect();
          return { width: r.width, height: r.height };
        };
        return {
          panel: rect(el),
          padding: getComputedStyle(el).padding,
          firstCard: rect(card),
          font: getComputedStyle(card.querySelector(".moment-card__content"))
            .font,
          grid: rect(gallery),
          tiles: [...gallery.children].map(rect),
          cards: el.querySelectorAll(".moment-card").length,
        };
      });
    for (const dark of [false, true]) {
      const mode = dark ? "dark" : "light";
      await page.evaluate((value) => {
        localStorage.setItem("theme", value);
        localStorage.setItem("shirone:theme", value);
      }, mode);
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--mc-primary")
          .trim(),
      );
      await page.waitForTimeout(600);
      await page.evaluate(() => {
        const section = document.querySelector(
          ".moment-section,.moments-section",
        );
        window.scrollTo(0, scrollY + section.getBoundingClientRect().top - 90);
      });
      await page.screenshot({ path: `${dir}/${site}-${size}-${mode}-top.png` });
      await page
        .locator(".moment-card")
        .nth(1)
        .screenshot({
          path: `${dir}/${site}-${size}-${mode}-gallery.png`,
          style:
            ".topbar,#navbar,.floating-controls,astro-dev-toolbar{visibility:hidden!important}",
        });
    }
    const tiles = page
      .locator(".moment-card")
      .nth(1)
      .locator(".moment-card__tile");
    measurements[`${site}-${size}`] = { ...(await measure()), errors };
    await tiles.nth(1).click();
    await page
      .locator(".moment-viewer")
      .screenshot({
        path: `${dir}/${site}-${size}-viewer.png`,
        style:
          ".topbar,#navbar,.floating-controls,astro-dev-toolbar{visibility:hidden!important}",
      });
    await page.close();
  }
}
await writeFile(
  `${dir}/measurements.json`,
  JSON.stringify(measurements, null, 2),
);
await browser.close();
