import { test, expect } from "@playwright/test";
test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

test("article sidebars pin below the header and stop at the shell boundary", async ({
  page,
}) => {
  await page.goto("/posts/markdown-mermaid/");
  await expect(page.locator('[data-mermaid-state="ready"]')).toHaveCount(14, {
    timeout: 30000,
  });
  await page.evaluate(() =>
    window.scrollTo({ top: 2400, behavior: "instant" }),
  );
  const sticky = page.locator(".sidebar-sticky");
  await expect(sticky).toHaveCount(2);
  for (const column of await sticky.all()) {
    await expect(column).toHaveCSS("position", "sticky");
    const box = await column.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(72);
    expect(box!.y).toBeLessThanOrEqual(90);
    expect(box!.y + box!.height).toBeLessThanOrEqual(900);
  }
  await page.locator(".sidebar-sticky .toc a").last().click();
  await expect(page).toHaveURL(/#/);
  await page.locator(".article-panel .post-meta a").first().click();
  await expect(page).toHaveURL(/archive/);
  await expect(page.locator(".secondary-sidebar .toc")).toHaveCount(0);
  await page.goBack();
  await expect(page.locator(".secondary-sidebar .toc")).toBeVisible();
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    }),
  );
  const shell = await page.locator(".shell").boundingBox();
  for (const column of await sticky.all()) {
    const box = await column.boundingBox();
    expect(box!.y + box!.height).toBeLessThanOrEqual(
      shell!.y + shell!.height + 1,
    );
  }
});

test("short viewports keep sidebars scrollable while mobile disables docking", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 560 });
  await page.goto("/posts/markdown/");
  await page.evaluate(() =>
    window.scrollTo({ top: 2000, behavior: "instant" }),
  );
  const left = page.locator(".sidebar:not(.secondary-sidebar) .sidebar-sticky");
  await expect(left).toHaveCSS("overflow-y", "auto");
  const box = await left.boundingBox();
  expect(box!.y + box!.height).toBeLessThanOrEqual(560);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(left).toHaveCSS("position", "static");
  await expect(left).toHaveCSS("max-height", "none");
  await expect(page.locator(".secondary-sidebar")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
