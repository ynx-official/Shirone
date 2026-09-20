import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("trees retain expanded branches, intact icons and compact navigation", async ({
  page,
}) => {
  await page.goto("/posts/markdown-enhancements/");
  const tree = page.locator(".m3-code-tree");
  await expect(
    tree.getByRole("button", { name: "Button.vue", exact: true }),
  ).toBeVisible();
  await expect(tree.locator("svg").first()).toHaveAttribute(
    "viewBox",
    "0 0 24 24",
  );
  await expect(tree.locator(".m3-code-tree__tree-root")).toHaveCSS(
    "padding-left",
    "0px",
  );
  await expect(
    page.locator('link[href="/styles/markdown/disclosures.css"]'),
  ).toHaveCount(1);
});

test("switching files and fullscreen preserves the code viewer", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/posts/markdown-enhancements/");
  await expect(page.locator("[data-trees-ready]")).toHaveAttribute(
    "data-trees-ready",
    "true",
  );
  const tree = page.locator(".m3-code-tree");
  await tree.getByRole("button", { name: "package.json", exact: true }).click();
  await expect(tree.locator('[data-file-path="package.json"]')).toBeVisible();
  await expect(
    tree.locator('[data-file-path="app/components/Button.vue"]'),
  ).toBeHidden();
  await expect(
    tree.getByRole("button", { name: "package.json", exact: true }),
  ).toHaveAttribute("tabindex", "0");
  await tree.locator(".m3-code-tree__expand-btn").click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog.locator(".m3-code-tree__body")).toHaveCSS(
    "display",
    "flex",
  );
  await expect(dialog).toHaveAccessibleName("按钮组件示例");
  await expect(dialog.locator(".m3-code-tree__file-btn").first()).toHaveCSS(
    "justify-content",
    "flex-start",
  );
  const panel = dialog.locator('[data-file-path="package.json"]');
  await panel.hover();
  await panel.locator("[data-copy-code]").click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain('"name": "button-demo"');
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(tree.locator(".m3-code-tree__expand-btn")).toBeFocused();
  await tree.getByRole("button", { name: "Button.vue", exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    tree.getByRole("button", { name: "button.css", exact: true }),
  ).toBeFocused();
  await expect(
    tree.locator('[data-file-path="app/assets/button.css"]'),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(tree.locator(".m3-code-tree__body")).toHaveCSS(
    "flex-direction",
    "column",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .include(".m3-code-tree")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.locator(".article-panel .post-meta a").first().click();
  await expect(page).toHaveURL(/archive/);
  await page.goBack();
  await expect(page.locator("[data-trees-ready]")).toBeVisible();
  await tree.getByRole("button", { name: "package.json", exact: true }).click();
  await expect(tree.locator('[data-file-path="package.json"]')).toBeVisible();
});

test("native file branches and initial code remain usable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/posts/markdown-enhancements/");
  const tree = page.locator(".m3-file-tree").first();
  await tree.locator("summary").first().click();
  await expect(
    tree.locator(".m3-file-tree__name").filter({ hasText: /^components$/ }),
  ).toBeVisible();
  await expect(
    page.locator('.m3-code-tree [data-file-path="app/components/Button.vue"]'),
  ).toBeVisible();
  await context.close();
});
