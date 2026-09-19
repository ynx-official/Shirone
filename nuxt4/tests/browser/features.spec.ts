import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
const database = JSON.parse(await readFile(".generated/public.json", "utf8"));

test("all public route families, posts, feeds and concurrent SSR respond", async ({
  request,
}) => {
  const paths = [
    "/",
    "/2/",
    "/archive/",
    "/categories/",
    "/tags/",
    "/series/",
    "/about/",
    "/rss.xml",
    "/atom.xml",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
    "/llms-full.txt",
    ...database.site.pages.map((k: string) => `/${k}/`),
    ...database.posts.map((p: any) => p.url),
    ...database.collections.albums.map((p: any) => `/albums/${p.id}/`),
  ];
  for (let i = 0; i < paths.length; i += 8) {
    const results = await Promise.all(
      paths.slice(i, i + 8).map(async (path) => {
        const result = await request.get(`http://127.0.0.1:4323${path}`);
        expect(result.status(), path).toBe(200);
        expect(await result.text(), path).not.toContain(
          "Congratulations! You have successfully unlocked",
        );
      }),
    );
    expect(results.length).toBeGreaterThan(0);
  }
  for (const path of [
    "/api/mock/include?id=content/snippets/test.md",
    "/.generated/admin.json",
    "/images/albums/EncryptedExample/info.json",
  ])
    expect((await request.get(`http://127.0.0.1:4323${path}`)).status()).toBe(
      404,
    );
});

test("Pagefind searches article bodies", async ({ page }) => {
  await page.goto("/search/");
  await page.getByRole("searchbox").fill("Markdown");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator("article h2 a").first()).toBeVisible();
});

test("protected article decrypts locally and clears on navigation", async ({
  page,
}) => {
  await page.goto("/posts/encrypted-demo/");
  await expect(page.locator(".prose")).toHaveCount(0);
  await page.locator("input[type=password]").fill("wrong");
  await page.locator("article form button").click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.locator("input[type=password]").fill("shirone-secret");
  await page.locator("article form button").click();
  await expect(page.locator(".prose")).toContainText("Congratulations!");
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/"),
    page.locator("a.brand").click(),
  ]);
  await expect(page.locator(".post-card").first()).toBeVisible();
  expect(await page.content()).not.toContain("Congratulations!");
});

test("media persists in IndexedDB and can be removed", async ({ page }) => {
  await page.goto("/admin/media");
  await expect(page.locator(".admin-main")).toBeVisible();
  await expect(page.locator("input[type=file]")).toBeEnabled();
  await page.locator("input[type=file]").setInputFiles({
    name: "pixel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.locator(".media-grid article")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".media-grid article")).toHaveCount(1);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.locator(".media-grid article")).toHaveCount(0);
});

test("mobile layout fits the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".post-card").first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".cache/screenshots/home-mobile.png",
    fullPage: true,
  });
});

test("local Markdown preview compiles extended syntax and reset restores seed", async ({
  page,
}) => {
  await page.goto("/admin/posts");
  await page.locator(".entity-list button").first().click();
  await page.getByLabel("Title", { exact: true }).fill("Preview fixture");
  await page
    .getByLabel("Markdown", { exact: true })
    .fill(
      "# Preview heading\n\n:::tip\nPreview callout\n:::\n\n$$x^2 + y^2 = z^2$$",
    );
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.locator(".prose")).toContainText("Preview heading");
  await expect(page.locator(".prose .katex").first()).toBeVisible();
  await page.goto("/admin/tools");
  await expect(page.getByLabel("Import JSON")).toBeEnabled();
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset data", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved locally");
  expect(
    await page.evaluate(() => localStorage.getItem("shirone:admin:v1")),
  ).toBeNull();
});

test("mock mode avoids third-party SDK requests and optional markup", async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.text().includes("Hydration")) errors.push(m.text());
  });
  page.on("request", (request) => {
    if (
      /api\.github\.com|giscus\.app|umami|player\.bilibili|youtube-nocookie/.test(
        request.url(),
      )
    )
      requests.push(request.url());
  });
  await page.goto("/posts/guide/");
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(
    page.locator('script[src*="giscus"],script[data-website-id]'),
  ).toHaveCount(0);
});
