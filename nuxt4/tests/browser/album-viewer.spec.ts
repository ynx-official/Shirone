import { test, expect } from "@playwright/test";
test.use({ reducedMotion: "reduce" });

test("album uses masonry and a full image viewer with navigation and focus return", async ({
  page,
}) => {
  await page.goto("/albums/AcgExample/");
  const gallery = page.locator(".album-gallery--masonry");
  await expect(gallery).toBeVisible();
  await expect(page.locator("[data-album-ready]")).toBeVisible();
  const first = gallery.locator("a").first();
  await first.click();
  const viewer = page.locator(".fancybox__container");
  await expect(viewer).toBeVisible();
  await expect(viewer.locator(".f-counter")).toContainText("1");
  await page.keyboard.press("ArrowRight");
  await expect(viewer.locator(".f-counter")).toContainText("2");
  await expect(viewer.locator('[data-panzoom-action="zoomIn"]')).toBeVisible();
  const image = viewer.locator(
    ".fancybox__slide.is-selected .f-panzoom__content:not(.is-clone)",
  );
  await expect(image).toBeVisible();
  const before = await image.boundingBox();
  await viewer.locator('[data-panzoom-action="zoomIn"]').click();
  await expect
    .poll(async () => (await image.boundingBox())!.width)
    .toBeGreaterThan(before!.width + 10);
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
  await expect(first).toBeFocused();
  await gallery.locator("a").nth(3).click();
  await expect(viewer.locator(".f-counter")).toContainText("4");
  await page.keyboard.press("Escape");
});

test("mobile viewer fills the viewport and closes without leaving scroll locked", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/albums/AcgExample/");
  await expect(page.locator("[data-album-ready]")).toBeVisible();
  await page.locator(".album-gallery a").first().click();
  const viewer = page.locator(".fancybox__container");
  await expect(viewer).toBeVisible();
  await expect.poll(async () => (await viewer.boundingBox())!.width).toBe(390);
  await viewer.getByRole("button", { name: "Close", exact: true }).click();
  await expect(viewer).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/with-fancybox/);
});

test("album original image links work without JavaScript and mobile stays contained", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/albums/AcgExample/");
  const image = page.locator(".album-gallery a").first();
  await expect(image).toHaveAttribute("href", /\/images\/albums\/AcgExample\//);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("album detail separates its cover metadata and gallery", async ({
  page,
}) => {
  await page.goto("/albums/AcgExample/");
  const hero = page.locator(".album-detail__hero");
  await expect(hero).toBeVisible();
  await expect(hero.locator("h1")).toBeVisible();
  await expect(hero.locator("img")).toHaveAttribute("src", /.+/);
  await expect(hero.locator("time")).toBeVisible();
  await expect(hero.locator(".album-detail__meta")).toContainText("22 photos");
  await expect(hero.locator(".album-detail__tags")).toBeVisible();
  const gallery = page.locator(".album-detail__gallery");
  expect((await gallery.boundingBox())!.y).toBeGreaterThan(
    (await hero.boundingBox())!.y + (await hero.boundingBox())!.height,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await hero.getByRole("link", { name: "Back to albums" }).click();
  await expect(page).toHaveURL(/\/albums\/$/);
});

test("album external metadata and photos render without local files", async ({
  page,
}) => {
  await page.goto("/albums/ExternalExample/");
  await expect(page.locator("[data-album-ready]")).toBeVisible();
  await expect(page.locator(".album-detail__meta")).toContainText("2 photos");
  await expect(page.locator(".album-gallery a")).toHaveCount(2);
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const results = await new AxeBuilder({ page })
    .include(".album-detail")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact || ""),
    ),
  ).toEqual([]);
});
