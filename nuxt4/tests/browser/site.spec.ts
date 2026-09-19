import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("production SSR contains articles and blocks admin", async ({
  request,
}) => {
  const response = await request.get("http://127.0.0.1:4323/");
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("post-card");
  expect(html).toContain("Shirone");
  for (const path of ["/admin", "/admin/preview", "/api/mock/admin"])
    expect((await request.get(`http://127.0.0.1:4323${path}`)).status()).toBe(
      404,
    );
  expect(
    (await request.get("http://127.0.0.1:4323/not-a-real-page")).status(),
  ).toBe(404);
});
test("without JavaScript article content remains readable", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4323/posts/markdown/");
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator(".prose")).toContainText("An h1 header");
  await context.close();
});
test("navigation and theme have no hydration errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.text().includes("Hydration")) errors.push(m.text());
  });
  await page.goto("/");
  await page.locator(".post-card h2 a").first().click();
  await expect(page.locator("article.panel h1")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".post-card").first()).toBeVisible();
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  expect(errors).toEqual([]);
});
test("local edit persists and never changes public SSR", async ({
  page,
  request,
}) => {
  await page.goto("/admin/posts");
  await page.locator(".entity-list button").first().click();
  const title = page.getByLabel("Title", { exact: true });
  await title.fill("Browser local changed title");
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved locally");
  await page.reload();
  await page
    .getByRole("button", { name: "Browser local changed title", exact: true })
    .click();
  await expect(title).toHaveValue("Browser local changed title");
  const publicPage = await request.get("/api/mock/page?path=/");
  expect(await publicPage.text()).not.toContain("Browser local changed title");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Browser local changed title" }),
  ).toBeVisible();
});
test("invalid JSON import preserves edits", async ({ page }) => {
  await page.goto("/admin/tools");
  await expect(page.getByLabel("Import JSON")).toBeEnabled();
  await page.getByLabel("Import JSON").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole("status")).toContainText("Invalid data");
  expect(
    await page.evaluate(() => localStorage.getItem("shirone:admin:v1")),
  ).toBeNull();
});
test("home has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".post-card").first()).toBeVisible();
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            (animation as CSSAnimation).animationName === "shirone-enter-up",
        )
        .map((animation) => animation.finished.catch(() => {})),
    ),
  );
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});
