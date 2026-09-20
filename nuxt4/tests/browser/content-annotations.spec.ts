import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.use({ reducedMotion: "reduce" });

test("annotations open beside their marker and preserve rich content and grouped notes", async ({
  page,
}) => {
  await page.goto("/posts/content-annotations/");
  const notes = page.locator(".m3-content-note__popover");
  await expect(notes).toHaveCount(3);
  for (const note of await notes.all()) await expect(note).toBeHidden();
  await page.getByRole("button", { name: "ssr", exact: true }).click();
  await expect(page.locator(":popover-open")).toContainText(
    "服务器生成页面 HTML",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(":popover-open")).toHaveCount(0);
  const rich = page.getByRole("button", { name: "rich-note", exact: true });
  await rich.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(":popover-open strong")).toHaveText("编写建议");
  await expect(page.locator(":popover-open li")).toHaveCount(3);
  await expect(page.locator(":popover-open ul")).toHaveCSS("list-style-type", "disc");
  await expect(page.locator(":popover-open code")).toHaveText("useAsyncData");
  await page.getByRole("button", { name: "review", exact: true }).click();
  await expect(page.locator(":popover-open")).toHaveCount(1);
  await expect(
    page.locator(":popover-open .m3-content-note__item"),
  ).toHaveCount(3);
  const accessibility = await new AxeBuilder({ page })
    .include(".article-panel")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.locator(".article-panel .post-meta a").first().click();
  await expect(page).toHaveURL(/archive/);
  await expect(page.locator(":popover-open")).toHaveCount(0);
  await page.goBack();
  await page.getByRole("button", { name: "ssr", exact: true }).click();
  await expect(page.locator(":popover-open")).toBeVisible();
});

test("annotations work on mobile without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/posts/content-annotations/");
  await page.getByRole("button", { name: "rich-note", exact: true }).tap();
  const note = page.locator(":popover-open");
  await expect(note).toBeVisible();
  const box = await note.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  await page.getByRole("button", { name: "rich-note", exact: true }).tap();
  await expect(note).toHaveCount(0);
  await context.close();
});
