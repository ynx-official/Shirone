import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch();
await mkdir("docs/comparison/settings", { recursive: true });
for (const [name, url, button, panel] of [
  [
    "original",
    "http://localhost:4321",
    "#display-settings-switch",
    "#display-setting",
  ],
  [
    "nuxt",
    process.env.NUXT_COMPARE_URL || "http://127.0.0.1:4322",
    'button[aria-label="Theme Color"]',
    ".display-settings",
  ],
]) {
  if (process.env.COMPARE_SITE && name !== process.env.COMPARE_SITE) continue;
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  if (name === "nuxt")
    await expect(
      page.getByRole("button", { name: "Theme", exact: true }),
    ).toBeEnabled({ timeout: 60000 });
  await page.locator(button).click();
  await page.locator(panel).waitFor({ state: "visible" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `docs/comparison/settings/${name}-panel.png` });
  console.log(name, await page.locator(panel).innerText());
  await page.locator(button).click();
  await page.evaluate(() => window.scrollTo(0, 750));
  await page.getByRole("button", { name: /More/ }).hover();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `docs/comparison/settings/${name}-menu.png` });
  await page.evaluate((name) => {
    if (name === "original") {
      localStorage.setItem("hue", "235");
      localStorage.setItem("mc-style", "rainbow");
      localStorage.setItem("mc-spec", "2021");
      localStorage.setItem("wallpaper-mode", "none");
    } else {
      localStorage.setItem(
        "shirone:palette",
        JSON.stringify({ hue: 235, style: "rainbow", spec: "2021" }),
      );
      localStorage.setItem(
        "shirone:display",
        JSON.stringify({
          wallpaper: "none",
          layout: "list",
          texture: "starlight",
          reduced: true,
        }),
      );
    }
  }, name);
  await page.reload();
  if (name === "nuxt")
    await expect(
      page.getByRole("button", { name: "Theme", exact: true }),
    ).toBeEnabled();
  await page.locator(button).click();
  await page.locator(panel).waitFor({ state: "visible" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `docs/comparison/settings/${name}-235.png` });
  console.log(name, await page.locator(panel).boundingBox());
  await page.close();
}
await browser.close();
