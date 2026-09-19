import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const phase = process.argv[2] || "after";
const nuxtPort = Number(process.env.NUXT_COMPARE_PORT || 4322);
const routes = [
  ["home", "/"],
  ["article", "/posts/markdown/"],
  ["archive", "/archive/"],
  ["albums", "/albums/"],
  ["projects", "/projects/"],
];
const browser = await chromium.launch();
const measurements = {};
for (const [site, port] of phase === "before"
  ? [
      ["original", 4321],
      [phase, nuxtPort],
    ]
  : [[phase, nuxtPort]]) {
  await mkdir(`docs/comparison/${site}`, { recursive: true });
  for (const [size, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const [name, path] of routes) {
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      console.log("loading", site, size, path);
      await page.goto(`http://localhost:${port}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
      await page.evaluate(() =>
        Promise.race([
          document.fonts.ready.then(() => true),
          new Promise((r) => setTimeout(() => r(false), 15000)),
        ]),
      );
      await page.waitForTimeout(1800);
      console.log("capturing", site, size, path);
      await page.screenshot({
        timeout: 20000,
        animations: "disabled",
        path: `docs/comparison/${site}/${name}-${size}.png`,
      });
      measurements[`${site}/${name}/${size}`] = await page.evaluate(() => {
        const selectors = [
          "html",
          "body",
          "#navbar",
          ".topbar",
          "#banner-wrapper",
          ".banner",
          "#main-grid",
          ".shell",
          "#main-content-column",
          ".shell main",
          "#sidebar",
          ".sidebar",
          ".m3-blog-postcard",
          ".post-card",
          ".m3-profile__avatar-link",
          ".profile img",
        ];
        return Object.fromEntries(
          selectors.map((s) => {
            const e = document.querySelector(s);
            if (!e) return [s, null];
            const r = e.getBoundingClientRect(),
              c = getComputedStyle(e);
            return [
              s,
              {
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                font: c.font,
                fontSize: c.fontSize,
                lineHeight: c.lineHeight,
                padding: c.padding,
                gap: c.gap,
                radius: c.borderRadius,
                background: c.backgroundColor,
                color: c.color,
              },
            ];
          }),
        );
      });
      const content = page.locator(
        site === "original" ? "#main-content-column" : "main#main",
      );
      if (await content.count()) {
        const top = await content.evaluate(
          (e) => e.getBoundingClientRect().top + scrollY,
        );
        await page.evaluate((y) => scrollTo(0, Math.max(0, y - 80)), top);
        await page.waitForTimeout(200);
        await page.screenshot({
          timeout: 20000,
          animations: "disabled",
          path: `docs/comparison/${site}/${name}-${size}-content.png`,
        });
      }
      console.log(site, size, path, errors.length ? errors : "ok");
    }
    await context.close();
  }
}
await writeFile(
  `docs/comparison/${phase}-measurements.json`,
  JSON.stringify(measurements, null, 2),
);
await browser.close();
