import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const output = "docs/comparison/friends";
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const measurements = {};
for (const [name, url] of [
  ["original", "http://127.0.0.1:4321"],
  ["nuxt", process.env.FRIENDS_COMPARE_URL || "http://localhost:4322"],
]) {
  for (const [size, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${url}/friends/`);
    await page.locator(".friend-section").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.evaluate(() =>
      window.scrollTo(
        0,
        window.scrollY +
          document.querySelector(".friend-section").getBoundingClientRect()
            .top -
          110,
      ),
    );
    for (const mode of ["light", "dark"]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        mode === "dark",
      );
      await page.locator(".friend-section").screenshot({
        path: `${output}/${name}-${size}-${mode}.png`,
        // Component captures exclude the persistent shell's fixed overlays.
        style:
          ".topbar, #navbar, .floating-controls { visibility: hidden !important; }",
      });
    }
    measurements[`${name}-${size}`] = {
      section: await page.locator(".friend-section").boundingBox(),
      card: await page.locator(".friend-card").first().boundingBox(),
      errors,
    };
    await page.close();
  }
}
await writeFile(
  `${output}/measurements.json`,
  JSON.stringify(measurements, null, 2),
);
await browser.close();
