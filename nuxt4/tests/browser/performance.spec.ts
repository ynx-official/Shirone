import { test, expect } from "@playwright/test";

test("homepage resources use optimized images and reuse the SSR language payload", async ({
  page,
  request,
}) => {
  const urls: string[] = [];
  page.on("request", (request) => urls.push(request.url()));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("combobox", { name: "Language", exact: true }),
  ).toHaveValue("en");
  const image = page.locator(".banner-media img");
  await expect(image).toHaveJSProperty("complete", true);
  expect(
    await image.evaluate((node: HTMLImageElement) => node.currentSrc),
  ).toContain("/assets/optimized/");
  const loadedFonts = await page.evaluate(async () =>
    (await document.fonts.load("16px Yozai", "首页字体")).map(
      (font) => font.status,
    ),
  );
  expect(loadedFonts).toEqual(["loaded"]);
  expect(urls.some((url) => /\.ttf(?:\?|$)|\/logo\/icon.webp/.test(url))).toBe(
    false,
  );
  expect(urls.some((url) => url.includes("/api/i18n"))).toBe(false);
  const favicon = await request.get("/_site/favicon.png");
  expect(favicon.ok()).toBe(true);
  expect((await favicon.body()).length).toBeLessThan(10000);
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("ja");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  expect(urls.some((url) => url.includes("/api/i18n?lang=ja"))).toBe(true);
});
