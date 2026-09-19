import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("language switch updates navigation, survives routes and renders the saved SSR locale", async ({
  page,
  context,
  browser,
}) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (/hydration/i.test(message.text())) hydrationErrors.push(message.text());
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  const selector = page.getByRole("combobox", {
    name: "Language",
    exact: true,
  });
  await expect(selector.locator("option")).toHaveCount(10);
  await selector.selectOption("zh_CN");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(
    page
      .locator(".desktop-navigation")
      .getByRole("link", { name: "主页", exact: true }),
  ).toBeVisible();
  await page
    .locator(".desktop-navigation")
    .getByRole("link", { name: "归档", exact: true })
    .click();
  await expect(page.locator(".archive-panel")).toBeVisible();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("combobox", { name: "语言", exact: true }),
  ).toHaveValue("zh_CN");
  expect(hydrationErrors).toEqual([]);

  const ssr = await browser.newContext({ javaScriptEnabled: false });
  await ssr.addCookies(await context.cookies());
  const saved = await ssr.newPage();
  await saved.goto("http://127.0.0.1:4323/", { waitUntil: "domcontentloaded" });
  await expect(saved.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(
    saved
      .locator(".desktop-navigation")
      .getByRole("link", { name: "主页", exact: true }),
  ).toBeVisible();
  await ssr.close();
  // A separate reader must retain the site default, not another user's locale.
  const independent = await browser.newContext({
    javaScriptEnabled: false,
    storageState: { cookies: [], origins: [] },
  });
  const other = await independent.newPage();
  await other.goto("http://127.0.0.1:4323/", { waitUntil: "domcontentloaded" });
  await expect(other.locator("html")).toHaveAttribute("lang", "zh-CN");
  await independent.close();
});

test("language switch fits mobile and supports keyboard selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  const selector = page.locator(".language-control select");
  await selector.focus();
  await expect(selector).toBeFocused();
  // Native select type-ahead remains keyboard-operable without opening an OS popup.
  await selector.press("e");
  await expect(selector).toHaveValue("es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("button", { name: "Navegación", exact: true }).click();
  await expect(
    page
      .locator(".mobile-nav")
      .getByRole("link", { name: "Inicio", exact: true }),
  ).toBeVisible();
  expect(
    await page.locator("html").evaluate((el) => el.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.setViewportSize({ width: 1100, height: 900 });
  await expect(page.locator(".desktop-navigation")).toBeHidden();
  await expect(page.locator(".drawer-toggle")).toBeVisible();
  const result = await new AxeBuilder({ page })
    .include(".topbar")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    result.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    ),
  ).toEqual([]);
});
