import { test, expect } from "@playwright/test";

test("desktop shell matches measured Astro geometry and header groups", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".post-card").first()).toBeVisible();
  const main = await page.locator("main#main").boundingBox();
  const banner = await page.locator(".banner").boundingBox();
  const card = await page.locator(".post-card").first().boundingBox();
  expect(main?.x).toBe(312);
  expect(main?.width).toBe(816);
  expect(main?.y).toBe(634);
  expect(banner?.height).toBe(650);
  expect(card?.y).toBe(698);
  await expect(page.locator(".profile-avatar")).toHaveCSS("width", "256px");
  await page.getByRole("button", { name: "More", exact: true }).click();
  await expect(
    page
      .locator(".nav-dropdown")
      .getByRole("link", { name: "Projects", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".nav-dropdown")).toHaveCount(0);
});
test("mobile retains cover, independent wallpaper and accessible navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".post-cover").first()).toBeVisible();
  const selectedBanner = await page
    .locator(".banner-media img")
    .evaluate((e: HTMLImageElement) => new URL(e.currentSrc).pathname);
  const mobileCandidates = await page
    .locator('.banner-media source[media="(max-width:1023px)"]')
    .getAttribute("srcset");
  expect(
    mobileCandidates
      ?.split(",")
      .map((candidate) => candidate.trim().split(/\s+/)[0]),
  ).toContain(selectedBanner);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  const main = await page.locator("main#main").boundingBox();
  expect(main?.x).toBe(7);
  expect(main?.width).toBe(376);
  expect(main?.y).toBeCloseTo(576.8, 0);
  await page.locator(".drawer-toggle").click();
  await page
    .locator(".mobile-nav")
    .getByRole("link", { name: "Archive", exact: true })
    .click();
  await expect(page.locator(".archive-panel")).toBeVisible();
  await expect(page.locator(".mobile-nav")).toHaveCount(0);
});
test("archive grouping and dedicated collection filtering work", async ({
  page,
}) => {
  await page.goto("/archive/");
  await page.getByRole("button", { name: "By Category", exact: true }).click();
  await expect(page.locator(".archive-group summary").first()).toContainText(
    /指南|示例/,
  );
  await expect(page.locator(".post-card")).toHaveCount(0);
  await page.goto("/projects/");
  await expect(page.locator(".project-card")).toHaveCount(3);
  await page.getByRole("button", { name: "安卓应用", exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(2);
  await page.getByRole("searchbox").fill("Folk");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.goto("/albums/");
  await expect(page.locator(".album-card")).toHaveCount(3);
  await expect(page.locator(".album-cover img")).toHaveCount(3);
  await page.getByRole("button", { name: "本地", exact: true }).click();
  await expect(page.locator(".album-card")).toHaveCount(1);
});
test("display preferences persist and music stays mounted during navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".music-panel audio")).toHaveCount(1);
  await page
    .locator(".music-panel audio")
    .evaluate((e) => e.setAttribute("data-persistence-probe", "kept"));
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.locator(".post-card h2 a").first().click();
  await expect(page.locator(".article-panel")).toBeVisible();
  await expect(page.locator(".music-panel audio")).toHaveAttribute(
    "data-persistence-probe",
    "kept",
  );
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Theme Color", exact: true }).click();
  await page
    .getByRole("radiogroup", { name: "Page background", exact: true })
    .getByRole("radio", { name: "Solid", exact: true })
    .check();
  await expect(page.locator(".banner")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".banner")).toHaveCount(0);
  await expect(page.locator("html")).toHaveClass(/dark/);
});
