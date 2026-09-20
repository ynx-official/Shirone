import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("article header retains cover, copy action and an integrated footer", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/posts/guide/");
  const article = page.locator(".article-panel");
  await expect(article.locator(".article-cover")).toBeVisible();
  await expect(article.locator(".article-cover")).toHaveJSProperty(
    "complete",
    true,
  );
  await article
    .getByRole("button", { name: "Copy link", exact: true })
    .first()
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("/posts/guide/");
  await expect(article.locator(".article-license")).toContainText(
    "CC BY-NC-SA 4.0",
  );
  await expect(article.locator(".article-share")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
});

test("article code controls do not affect geometry or copy line numbers", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/posts/expressive-code/");
  const frame = page.locator(".expressive-code .frame").first();
  const pre = frame.locator("pre");
  await expect(pre).toHaveCSS("padding", "0px");
  await expect(pre.locator("button")).toHaveCount(0);
  await frame.getByRole("button", { name: "Copy code", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("console.log('This code is syntax highlighted!')");
  await page.setViewportSize({ width: 390, height: 844 });
  const button = await frame.getByRole("button").boundingBox();
  expect(button!.x + button!.width).toBeLessThanOrEqual(390);
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
});

test("article headings clear the fixed header and retain accessible reading styles", async ({
  page,
}) => {
  await page.goto("/posts/markdown/");
  const heading = page.locator(".article-panel .prose h2").first();
  await heading.evaluate((el) => el.scrollIntoView());
  await expect
    .poll(async () => (await heading.boundingBox())!.y)
    .toBeGreaterThanOrEqual(64);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const results = await new AxeBuilder({ page })
    .include(".article-panel")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("article content and focusable equations remain available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/posts/markdown/`);
  await expect(page.locator(".article-panel .prose h1")).toBeVisible();
  await expect(page.locator(".katex-display").first()).toHaveAttribute(
    "tabindex",
    "0",
  );
  await expect(page.locator(".article-license")).toContainText(
    "CC BY-NC-SA 4.0",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("article controls survive client navigation and dark mobile reading", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/posts/guide/");
  await expect(page.locator(".article-copy-link")).toBeEnabled();
  await page.locator(".article-panel .post-meta a").first().click();
  await expect(page).toHaveURL(/archive/);
  await page.goBack();
  await expect(page.locator(".article-cover")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const results = await new AxeBuilder({ page })
    .include(".article-panel")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
