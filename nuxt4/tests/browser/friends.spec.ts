import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("friends search, tags, URL restoration and empty results", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (/hydration/i.test(message.text())) errors.push(message.text());
  });
  await page.goto("/friends/");
  await page.waitForFunction(() =>
    Boolean(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--mc-primary")
        .trim(),
    ),
  );
  await expect(page.locator(".friend-card")).toHaveCount(3);
  const search = page.getByRole("searchbox", { name: "Search", exact: true });
  await search.fill("  ASTRO.BUILD  ");
  await expect(page.locator(".friend-card")).toHaveCount(1);
  await expect(page.locator(".friend-card")).toHaveAttribute(
    "href",
    "https://astro.build",
  );
  await expect(page).toHaveURL(/q=/);
  await page.reload();
  await expect(page.locator(".friend-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.locator(".friend-card")).toHaveCount(3);
  await page.getByRole("button", { name: "设计", exact: true }).click();
  await expect(page.locator(".friend-card")).toHaveCount(1);
  await expect(page.locator(".friend-card")).toContainText("Material 3");
  await search.fill("no-such-friend");
  await expect(page.locator(".friend-section__empty")).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("button", { name: "设计", exact: true }).click();
  await expect(page.locator(".friend-card")).toHaveCount(3);
  await search.fill("主题");
  await expect(page.locator(".friend-card")).toHaveCount(1);
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("主题");
  await page.locator('.topbar a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".post-card").first()).toBeVisible();
  await page.goBack();
  await expect(search).toHaveValue("主题");
  await expect(page.locator(".friend-card")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("friends SSR works without JavaScript and applies shared filters", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${test.info().project.use.baseURL}/friends/?q=astro.build`);
  await expect(page.locator(".friend-card")).toHaveCount(1);
  await expect(page.locator(".friend-card")).toContainText("Astro");
  await expect(page.locator(".friend-card")).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  await context.close();
});

test("friends desktop/mobile layout, dark theme and accessibility", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/friends/");
  await expect(page.locator(".friend-card")).toHaveCount(3);
  const first = await page.locator(".friend-card").nth(0).boundingBox();
  const second = await page.locator(".friend-card").nth(1).boundingBox();
  expect(first?.y).toBe(second?.y);
  for (const dark of [false, true]) {
    await page.evaluate(
      (value) => document.documentElement.classList.toggle("dark", value),
      dark,
    );
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).include(".friend-section").analyze())
          .violations,
      ).toEqual([]);
    }
  }
});
