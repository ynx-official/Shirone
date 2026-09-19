import { test, expect } from "@playwright/test";

test("route progress follows delayed navigation, banner position and back navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  const bar = page.locator(".route-progress");
  await expect(bar).toHaveCSS("opacity", "0");
  await expect(bar).toHaveCSS("top", "0px");
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/mock/page?**", async (route) => {
    if (new URL(route.request().url()).searchParams.get("path") === "/archive/")
      await gate;
    await route.continue();
  });
  await page
    .locator(".desktop-navigation")
    .getByRole("link", { name: "Archive", exact: true })
    .click();
  await expect(bar).toHaveCSS("opacity", "1");
  await expect(bar.locator(".route-progress__line")).toHaveCount(2);
  await expect(bar.locator(".route-progress__line--1")).toHaveCSS(
    "animation-duration",
    "1.75s, 1.75s",
  );
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
  await expect(bar).toHaveCSS("top", "64px");
  await expect(bar).toHaveCSS("opacity", "1");
  release();
  await expect(page.locator(".archive-panel")).toBeVisible();
  await expect(bar).toHaveCSS("opacity", "0");
  await page.goBack();
  await expect(page.locator(".post-card").first()).toBeVisible();
  await expect(bar).toHaveCSS("opacity", "0");
  await expect(bar).toHaveCount(1);
});

test("route progress stops for failed requests and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/mock/page?**", async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("path") === "/archive/"
    ) {
      await gate;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          statusCode: 500,
          statusMessage: "Fixture failure",
        }),
      });
    } else await route.continue();
  });
  await page
    .locator(".desktop-navigation")
    .getByRole("link", { name: "Archive", exact: true })
    .click();
  const bar = page.locator(".route-progress");
  await expect(bar).toHaveCSS("opacity", "1");
  await expect(bar.locator(".route-progress__line--1")).toHaveCSS(
    "animation-name",
    "none",
  );
  expect(
    (await bar.locator(".route-progress__line--1").boundingBox())!.width,
  ).toBeGreaterThan(0);
  release();
  await expect(page.locator(".route-progress--visible")).toHaveCount(0, {
    timeout: 15000,
  });
});

test("route progress remains perceptible on fast local navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  await page
    .locator(".desktop-navigation")
    .getByRole("link", { name: "Archive", exact: true })
    .click();
  await expect(page.locator(".route-progress")).toHaveClass(
    /route-progress--visible/,
  );
  await expect(page.locator(".archive-panel")).toBeVisible();
  await expect(page.locator(".route-progress")).toHaveCSS("opacity", "0");
});

test("route progress sits below the mobile header when its banner is hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/archive/");
  const header = await page.locator(".topbar").boundingBox();
  await expect(page.locator(".route-progress")).toHaveCSS(
    "top",
    `${header!.height}px`,
  );
  await expect(page.locator(".route-progress")).toHaveCSS("opacity", "0");
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  await page.locator(".brand").click();
  await expect(page.locator(".post-card").first()).toBeVisible();
  await expect(page.locator(".route-progress")).toHaveCSS("top", "0px");
});
