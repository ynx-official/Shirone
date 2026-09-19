import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const name = process.argv[2] || "nuxt";
const original = name === "original";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "light",
  reducedMotion: "no-preference",
});
await page.goto(
  original
    ? "http://localhost:4321/"
    : process.env.NUXT_COMPARE_URL || "http://127.0.0.1:4322/",
  { waitUntil: "domcontentloaded", timeout: 90000 },
);
if (!original)
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled({ timeout: 60000 });
await page.evaluate(() =>
  Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]),
);
await mkdir("docs/comparison/entrance", { recursive: true });
const animationName = original ? "fade-in-up" : "shirone-enter-up";
const metadata = await page.evaluate(
  (animationName) =>
    document
      .getAnimations()
      .filter((a) => a.animationName === animationName)
      .map((a) => ({
        target: a.effect.target.id || a.effect.target.className,
        ...a.effect.getTiming(),
      })),
  animationName,
);
await writeFile(
  `docs/comparison/entrance/${name}.json`,
  JSON.stringify(metadata, null, 2),
);
for (const time of [150, 350, 800]) {
  await page.evaluate(
    ({ animationName, time }) => {
      for (const a of document.getAnimations()) {
        if (a.animationName === animationName) {
          a.pause();
          a.currentTime = time;
        }
      }
    },
    { animationName, time },
  );
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.screenshot({
    path: `docs/comparison/entrance/${name}-${time}.png`,
  });
}
await browser.close();
