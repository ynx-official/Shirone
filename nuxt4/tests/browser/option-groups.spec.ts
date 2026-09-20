import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.use({ reducedMotion: "reduce" });

test("option groups initialize, synchronize and persist their selected command", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/posts/option-groups/");
  const groups = page.locator(".m3-option-group");
  await expect(groups).toHaveCount(3);
  await expect(groups.first().getByRole("tabpanel")).toHaveCount(1);
  await expect(groups.first().getByRole("tabpanel")).toContainText(
    "pnpm install",
  );
  await groups.first().getByRole("tab", { name: "Bun", exact: true }).click();
  for (const group of [groups.nth(0), groups.nth(1)]) {
    await expect(group.getByRole("tab", { selected: true })).toHaveText("Bun");
    await expect(group.getByRole("tab", { selected: true })).toHaveClass(
      /tab--active/,
    );
    await expect(group.getByRole("tabpanel")).toContainText("bun");
  }
  const panel = groups.first().getByRole("tabpanel");
  await panel.hover();
  await panel.locator("[data-copy-code]").click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("bun install");
  await page.reload();
  await expect(groups.first().getByRole("tab", { selected: true })).toHaveText(
    "Bun",
  );
  const results = await new AxeBuilder({ page })
    .include(".article-panel")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.locator(".article-panel .post-meta a").first().click();
  await expect(page).toHaveURL(/archive/);
  await page.goBack();
  await expect(groups.first()).toHaveAttribute("data-option-group-ready", "true");
  await groups.first().getByRole("tab", { name: "npm", exact: true }).click();
  await expect(groups.nth(1).getByRole("tabpanel")).toContainText("npm run dev");
});

test("mobile tab keyboard navigation scrolls the strip and keeps groups independent", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/posts/option-groups/");
  const groups = page.locator("[data-option-group-ready]");
  await expect(groups).toHaveCount(3);
  const last = groups.last();
  await last.getByRole("tab").first().focus();
  await page.keyboard.press("End");
  await expect(last.getByRole("tab", { selected: true })).toHaveText(
    "离线恢复",
  );
  await expect(last.getByRole("tab", { selected: true })).toBeFocused();
  const tabBox = await last.getByRole("tab", { selected: true }).boundingBox();
  expect(tabBox!.x + tabBox!.width).toBeLessThanOrEqual(390);
  await expect(groups.first().getByRole("tab", { selected: true })).toHaveText(
    "pnpm",
  );
  await page.keyboard.press("Home");
  await expect(last.getByRole("tab", { selected: true })).toHaveText(
    "本地开发",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("all option group content remains readable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/posts/option-groups/");
  await expect(page.getByRole("tabpanel")).toHaveCount(11);
  for (const panel of await page.getByRole("tabpanel").all())
    await expect(panel).toBeVisible();
  await context.close();
});
