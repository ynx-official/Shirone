import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.use({ reducedMotion: "reduce" });

test("abbreviation explanations stay hidden until hover or keyboard focus", async ({
  page,
}) => {
  await page.goto("/posts/markdown-abbreviations/");
  const tips = page.locator(".m3-abbreviation__popover");
  await expect(tips).toHaveCount(4);
  for (const tip of await tips.all()) await expect(tip).toBeHidden();
  const term = page.locator("abbr").first();
  await expect(term).toHaveAttribute("data-enhanced", "true");
  await term.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await term.hover();
  await expect(page.locator(":popover-open")).toHaveText("服务端渲染");
  await page.keyboard.press("Escape");
  await expect(page.locator(":popover-open")).toHaveCount(0);
  await page.locator("abbr").nth(1).focus();
  await expect(page.locator(":popover-open")).toHaveText("最大内容绘制");
  const accessibility = await new AxeBuilder({ page }).include(".article-panel").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(accessibility.violations).toEqual([]);
  await expect(page.locator("code abbr")).toHaveCount(0);
  await page.locator(".article-panel .post-meta a").first().click();
  await expect(page).toHaveURL(/archive/);
  await expect(page.locator(":popover-open")).toHaveCount(0);
  await page.goBack();
  await expect(term).toHaveAttribute("data-enhanced", "true");
  await term.focus();
  await expect(page.locator(":popover-open")).toHaveText("服务端渲染");
});

test("abbreviations retain native explanations without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto("/posts/markdown-abbreviations/");
  await expect(page.locator("abbr").first()).toHaveAttribute(
    "title",
    "服务端渲染",
  );
  for (const tip of await page.locator(".m3-abbreviation__popover").all())
    await expect(tip).toBeHidden();
  await context.close();
});

test("touch toggles abbreviation explanations without clipping", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/posts/markdown-abbreviations/");
  const term = page.locator("abbr").first();
  await expect(term).toHaveAttribute("data-enhanced", "true");
  await term.tap();
  const tip = page.locator(":popover-open");
  await expect(tip).toHaveText("服务端渲染");
  const box = await tip.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await term.tap();
  await expect(tip).toHaveCount(0);
  await term.tap();
  await page.locator("h1").first().tap();
  await expect(tip).toHaveCount(0);
  await context.close();
});
