import { test, expect } from "@playwright/test";

test("all Mermaid diagrams are visible and contained on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/posts/markdown-mermaid/");
  const diagrams = page.locator(
    "[data-mermaid] .markdown-mermaid__diagram svg",
  );
  await expect(diagrams).toHaveCount(14, { timeout: 30000 });
  for (const diagram of await diagrams.all()) {
    await expect(diagram).toBeVisible();
  }
  await expect(page.locator('[data-mermaid-state="ready"]')).toHaveCount(14);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const diagram of await diagrams.all()) {
    await expect(diagram).toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("Mermaid source stays readable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/posts/markdown-mermaid/");
  const sources = page.locator("[data-mermaid] pre");
  await expect(sources).toHaveCount(14);
  for (const source of await sources.all()) await expect(source).toBeVisible();
  await context.close();
});
