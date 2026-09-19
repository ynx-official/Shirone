import { test, expect } from "@playwright/test";

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

test("Chinese mock is the default SSR and all public data pages use Chinese", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(
    page.getByRole("combobox", { name: "语言", exact: true }),
  ).toHaveValue("zh_CN");
  await expect(page.locator(".post-card").first()).toContainText(
    "Shirone 写作与使用指南",
  );
  await expect(
    page.getByRole("button", { name: "主题色", exact: true }),
  ).toBeVisible();
  const site = await (await request.get("/api/mock/site")).json();
  expect(site.lang).toBe("zh_CN");
  for (const domain of [
    "moments",
    "albums",
    "friends",
    "compass",
    "anime",
    "projects",
    "skills",
    "devices",
    "games",
    "timeline",
  ]) {
    const data = await (
      await request.get(`/api/mock/page?path=/${domain}/`)
    ).json();
    expect(data.items.length, domain).toBeGreaterThan(0);
    expect(
      data.items.every((item: { description: string }) =>
        /[\u3400-\u9fff]/.test(item.description),
      ),
      domain,
    ).toBe(true);
  }
  const old = await (
    await request.get("/api/mock/page?path=/archive/&category=Guides")
  ).json();
  const localized = await (
    await request.get("/api/mock/page?path=/archive/&category=指南")
  ).json();
  expect(old.total).toBeGreaterThan(0);
  expect(old.posts.map((post: { id: string }) => post.id)).toEqual(
    localized.posts.map((post: { id: string }) => post.id),
  );
  const rss = await (await request.get("/rss.xml")).text();
  expect(rss).toContain("Shirone 写作与使用指南");
  expect(rss).not.toContain("恭喜！你已成功解锁");
});

test("Chinese mock body search and captioned image assets work", async ({
  page,
  request,
}) => {
  await page.goto("/search/");
  await page.getByRole("searchbox").fill("语法");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  await expect(page.locator("article h2 a").first()).toBeVisible();
  expect(
    (await page.locator("article").allTextContents()).join("\n"),
  ).not.toContain("恭喜！你已成功解锁");
  await page.goto("/posts/image-grid-demo/");
  const src = await page.locator(".image-grid img").first().getAttribute("src");
  expect(src).toMatch(/^\/content-assets\//);
  expect((await request.get(src!)).status()).toBe(200);
  await expect(page.locator(".article-heading")).toContainText("图片网格");
});

test("Chinese mock diagram gallery still renders every example", async ({
  page,
}) => {
  await page.goto("/posts/markdown-mermaid/");
  await expect(page.locator("[data-mermaid]")).toHaveCount(14);
  await expect(page.locator(".markdown-mermaid__diagram > svg")).toHaveCount(
    14,
    { timeout: 45000 },
  );
});
