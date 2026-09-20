import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("theme panel preserves palette choices, reset and system appearance", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Public controls are SSR-rendered; wait for theme initialization before clicking.
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  const trigger = page.getByRole("button", {
    name: "Theme Color",
    exact: true,
  });
  await trigger.click();
  const panel = page.locator(".display-settings");
  await expect(panel.locator(".settings-dots > span")).toHaveCount(27);
  await expect(panel.getByRole("combobox")).toHaveCount(0);
  const slider = panel.getByRole("slider");
  await slider.focus();
  await slider.press("End");
  await slider.press("ArrowLeft");
  await expect(panel.locator("output")).toHaveText("355");
  const primary = await page
    .locator("html")
    .evaluate((e) => e.style.getPropertyValue("--primary"));
  await panel.getByRole("radio", { name: "Rainbow", exact: true }).check();
  await panel.getByRole("radio", { name: "MD3 2021", exact: true }).check();
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((e) => e.style.getPropertyValue("--primary")),
    )
    .not.toBe(primary);
  await panel.getByRole("radio", { name: "Solid", exact: true }).check();
  await panel.getByRole("radio", { name: "Grid", exact: true }).check();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  await trigger.click();
  await expect(panel.locator("output")).toHaveText("355");
  for (const name of ["Rainbow", "MD3 2021", "Solid", "Grid"])
    await expect(panel.getByRole("radio", { name, exact: true })).toBeChecked();
  await expect(page.locator(".banner")).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .include(".display-settings")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    ),
  ).toEqual([]);
  await panel.getByRole("button", { name: /reset/i }).click();
  await expect(panel.locator("output")).toHaveText("315");
  for (const name of ["Tonal Spot", "M3E 2025", "Banner", "List", "Starlight"])
    await expect(panel.getByRole("radio", { name, exact: true })).toBeChecked();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await trigger.click();
  await panel.getByRole("switch").check();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.locator("html")).toHaveClass(/motion-reduced/);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await page.getByRole("button", { name: "System", exact: true }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("More menu opens on hover with local icons and keyboard navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 750));
  const trigger = page.getByRole("button", { name: "More", exact: true });
  await trigger.hover();
  const menu = page.locator(".nav-dropdown");
  await expect(menu).toBeVisible();
  await expect(menu.locator("a")).toHaveCount(7);
  expect(
    await menu
      .locator("a")
      .evaluateAll((links) =>
        links.every((link) => !!link.querySelector("svg path")),
      ),
  ).toBe(true);
  const github = menu.getByRole("link", { name: "GitHub", exact: true });
  await github.hover();
  await expect(menu).toBeVisible();
  await expect(github).toHaveAttribute("target", "_blank");
  await expect(github.locator(".external-arrow")).toBeVisible();
  await page.mouse.move(10, 500);
  await expect(menu).toHaveCount(0);
  await trigger.focus();
  await trigger.press("ArrowDown");
  await expect(menu.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(menu).toHaveCount(0);
});

test("theme panel fits mobile and shows texture controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Theme Color", exact: true }).click();
  const panel = page.locator(".display-settings");
  const bounds = await panel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await panel
    .getByRole("radio", { name: "Sakura Petals", exact: true })
    .check();
  await expect(page.locator("html")).toHaveAttribute(
    "data-texture-preset",
    "sakura",
  );
  await panel.getByRole("switch").scrollIntoViewIfNeeded();
  await expect(panel.getByRole("switch")).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("theme panel changes homepage colors without a header color transition", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Theme Color", exact: true }).click();
  const panel = page.locator(".display-settings");
  await panel.getByRole("radio", { name: "Solid", exact: true }).check();
  await expect(page.locator(".topbar")).toHaveCSS("opacity", "1");
  await page.evaluate(() => {
    Object.assign(window, { paletteTransitions: [] });
    document.addEventListener("transitionrun", (event) => {
      if ((event.target as Element).closest(".topbar")) {
        (
          window as unknown as { paletteTransitions: string[] }
        ).paletteTransitions.push((event as TransitionEvent).propertyName);
      }
    });
  });
  const before = await page
    .locator("html")
    .evaluate((el) => el.style.getPropertyValue("--primary"));
  await panel.getByRole("radio", { name: "Vibrant", exact: true }).check();
  await panel.getByRole("slider").fill("180");
  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((el) => el.style.getPropertyValue("--primary")),
    )
    .not.toBe(before);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { paletteTransitions: string[] })
          .paletteTransitions,
    ),
  ).toEqual([]);
  await expect(page.locator(".topbar")).toHaveCSS("transition-duration", "0s");
});

test("Theme Color restores the saved palette before hydration on refresh", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Theme Color", exact: true }).click();
  await page.locator(".display-settings").getByRole("slider").fill("180");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("shirone:palette-cache:v1") || "null")
            ?.key,
      ),
    )
    .toContain("180");
  const expected = await page.locator(".public-site").evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    primary: document.documentElement.style.getPropertyValue("--primary"),
  }));
  // The inline head bootstrap must work even if Vue and the color engine never load.
  await page.route("**/_nuxt/**", (route) =>
    route.request().resourceType() === "script"
      ? route.abort()
      : route.continue(),
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(
    await page.locator(".public-site").evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      primary: document.documentElement.style.getPropertyValue("--primary"),
    })),
  ).toEqual(expected);
  await expect(
    page.getByRole("button", { name: "Theme", exact: true }),
  ).toBeDisabled();
  // A stale palette cache must never override a different saved color selection.
  await page.evaluate(() =>
    localStorage.setItem(
      "shirone:palette",
      JSON.stringify({ hue: 90, style: "tonalSpot", spec: "2025" }),
    ),
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(
    await page
      .locator("html")
      .evaluate((el) => el.style.getPropertyValue("--primary")),
  ).toBe("");
});
