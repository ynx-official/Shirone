import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("admin is client rendered while public pages retain SSR", async ({
  request,
}) => {
  for (const path of ["/admin", "/admin/media"]) {
    const response = await request.get(path);
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).not.toContain("admin-sidebar");
  }
  expect(await (await request.get("/")).text()).toContain("post-card");
});

test("navigation, tabs, editing and reload preserve local data", async ({
  page,
}) => {
  await page.goto("/admin/posts");
  await expect(page.locator(".admin-topbar")).toBeVisible();
  await page.locator(".entity-list button").first().click();
  await page.getByLabel("Title", { exact: true }).fill("Admin UI regression");
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved locally");
  await page.reload();
  await page
    .getByRole("button", { name: "Admin UI regression", exact: true })
    .click();
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Admin UI regression",
  );
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: "Media", exact: true })
    .click();
  await expect(
    page
      .locator(".admin-tabs")
      .getByRole("link", { name: "Media", exact: true }),
  ).toBeVisible();
  await page
    .locator(".admin-tabs")
    .getByRole("link", { name: "Articles", exact: true })
    .click();
  await expect(page).toHaveURL(/admin\/posts/);
  await page
    .getByRole("button", { name: "Close Articles", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin$/);
});

test("media cleanup protects referenced images and copies stable references", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/admin/media");
  await expect(page.getByLabel("Upload image", { exact: true })).toBeEnabled();
  const file = {
    name: "kept.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfL8AAAAASUVORK5CYII=",
      "base64",
    ),
  };
  await page
    .getByLabel("Upload image", { exact: true })
    .setInputFiles([file, { ...file, name: "unused.png" }]);
  const kept = page
    .locator(".admin-media-card")
    .filter({ hasText: "kept.png" });
  await kept
    .getByRole("button", { name: "Copy reference", exact: true })
    .click();
  const reference = await page.evaluate(() => navigator.clipboard.readText());
  expect(reference).toMatch(/^media:[a-f0-9-]+$/);
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: "Articles", exact: true })
    .click();
  await page.locator(".entity-list button").first().click();
  await page.getByLabel("Media", { exact: true }).fill(reference);
  await page.getByRole("button", { name: "Save locally", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved locally");
  await page
    .locator(".admin-sidebar")
    .getByRole("link", { name: "Media", exact: true })
    .click();
  await expect(kept).toContainText("Used by 1 items");
  await expect(
    kept.getByRole("button", { name: "Delete", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Clean unused images", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator(".admin-media-card")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Clean unused images", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete", exact: true })
    .last()
    .click();
  await expect(page.locator(".admin-media-card")).toHaveCount(1);
  await expect(kept).toBeVisible();
  await page.reload();
  await expect(kept).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Clean unused images", exact: true }),
  ).toBeDisabled();
});

test("media upload persists and deletion removes the card", async ({
  page,
}) => {
  await page.goto("/admin/media");
  await expect(page.getByLabel("Upload image", { exact: true })).toBeEnabled();
  await page.getByLabel("Upload image", { exact: true }).setInputFiles({
    name: "pixel.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfL8AAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(page.locator(".admin-media-card")).toContainText("pixel.png");
  await page.reload();
  await expect(page.locator(".admin-media-card img")).toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete", exact: true })
    .last()
    .click();
  await expect(page.locator(".admin-media-card")).toHaveCount(0);
});

test("admin supports mobile and accessible controls", async ({ page }) => {
  await page.goto("/admin/media");
  await expect(page.locator(".admin-topbar")).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: "Navigation", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Navigation", exact: true }).click();
  await expect(page.locator(".admin-sidebar")).toBeVisible();
  await expect(
    page.locator(".admin-sidebar").getByText("Media", { exact: true }),
  ).toBeVisible();
});

test("admin has independent neutral light and dark modes", async ({ page }) => {
  await page.goto("/admin/media");
  await expect(page.locator(".admin-topbar")).toBeVisible();
  const before = await page.evaluate(() =>
    localStorage.getItem("shirone:palette"),
  );
  await expect(
    page.getByRole("button", { name: "Theme Color", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".admin-shell")).toHaveAttribute(
    "data-appearance",
    "light",
  );
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator(".admin-shell")).toHaveAttribute(
    "data-appearance",
    "dark",
  );
  await page.reload();
  await expect(page.locator(".admin-shell")).toHaveAttribute(
    "data-appearance",
    "dark",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("shirone:palette")),
  ).toBe(before);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator(".admin-shell")).toHaveAttribute(
    "data-appearance",
    "light",
  );
});

test("media search and view toggle preserve uploaded records", async ({
  page,
}) => {
  await page.goto("/admin/media");
  const input = page.getByLabel("Upload image", { exact: true });
  await expect(input).toBeEnabled();
  const buffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jfL8AAAAASUVORK5CYII=",
    "base64",
  );
  await input.setInputFiles(
    ["forest.png", "lake.png"].map((name) => ({
      name,
      mimeType: "image/png",
      buffer,
    })),
  );
  await expect(page.locator(".admin-media-card")).toHaveCount(2);
  await page.getByRole("textbox", { name: "Search filenames" }).fill("FOREST");
  await expect(page.locator(".admin-media-card")).toHaveCount(1);
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await expect(page.locator(".media-grid")).toHaveClass(/is-list/);
  await page.getByRole("textbox", { name: "Search filenames" }).fill("missing");
  await expect(page.getByText("No items", { exact: true })).toBeVisible();
  await page.getByRole("textbox", { name: "Search filenames" }).fill("");
  await page.getByRole("button", { name: "Grid view", exact: true }).click();
  await expect(page.locator(".admin-media-card")).toHaveCount(2);
});
