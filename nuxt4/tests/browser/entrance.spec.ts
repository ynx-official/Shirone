import { test, expect } from "@playwright/test";

test("refresh entrance matches the original rise, duration and stagger", async ({
  page,
}) => {
  await page.goto("/");
  const timing = await page
    .locator(".topbar, .sidebar, .page-entry, .post-card, .site-footer")
    .evaluateAll((nodes) =>
      nodes.map((el) => {
        const s = getComputedStyle(el);
        return {
          classes: el.className,
          name: s.animationName,
          duration: s.animationDuration,
          delay: s.animationDelay,
          easing: s.animationTimingFunction,
        };
      }),
    );
  expect(
    timing.every(
      (item) =>
        item.name === "shirone-enter-up" &&
        item.duration === "0.3s" &&
        item.easing === "ease",
    ),
  ).toBe(true);
  expect(timing.find((item) => item.classes.includes("sidebar"))!.delay).toBe(
    "0.1s",
  );
  expect(
    timing.find((item) => item.classes.includes("page-entry"))!.delay,
  ).toBe("0.15s");
  expect(
    timing
      .filter((item) => item.classes.includes("post-card"))
      .slice(0, 3)
      .map((item) => item.delay),
  ).toEqual(["0.15s", "0.2s", "0.25s"]);
  expect(
    timing.find((item) => item.classes.includes("site-footer"))!.delay,
  ).toBe("0.25s");
  const card = page.locator(".post-card").first();
  const states = await card.evaluate((el) => {
    const animation = el
      .getAnimations()
      .find((a) => (a as CSSAnimation).animationName === "shirone-enter-up")!;
    animation.pause();
    animation.currentTime = 150;
    const start = {
      opacity: getComputedStyle(el).opacity,
      y: new DOMMatrix(getComputedStyle(el).transform).m42,
    };
    animation.currentTime = 300;
    const middle = {
      opacity: Number(getComputedStyle(el).opacity),
      y: new DOMMatrix(getComputedStyle(el).transform).m42,
    };
    animation.finish();
    return {
      start,
      middle,
      end: new DOMMatrix(getComputedStyle(el).transform).isIdentity,
    };
  });
  expect(states.start).toEqual({ opacity: "0", y: 32 });
  expect(states.middle.y).toBeGreaterThan(0);
  expect(states.middle.y).toBeLessThan(32);
  expect(states.middle.opacity).toBeGreaterThan(0);
  expect(states.end).toBe(true);
  await page.reload();
  await expect(card).toHaveCSS("animation-name", "shirone-enter-up");
  await expect(card).toHaveCSS("opacity", "1");
  // Navigating replaces page content without replaying the persistent header.
  const before = await page
    .locator(".topbar")
    .evaluate((el) => el.getAnimations()[0]!.startTime);
  await page
    .locator(".desktop-navigation")
    .getByRole("link", { name: "Archive", exact: true })
    .click();
  await expect(page.locator(".archive-panel")).toBeVisible();
  expect(
    await page
      .locator(".topbar")
      .evaluate((el) => el.getAnimations()[0]!.startTime),
  ).toBe(before);
});

test("refresh entrance respects system and saved motion preferences", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".post-card").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator(".post-card").first()).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() =>
    localStorage.setItem("shirone:display", JSON.stringify({ reduced: true })),
  );
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/motion-reduced/);
  await expect(page.locator(".post-card").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("refresh entrance leaves SSR content readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4323/posts/markdown/");
  await expect(page.locator(".article-heading")).toBeVisible();
  await expect(page.locator(".article-heading")).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      page
        .locator(".page-entry")
        .evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).isIdentity,
        ),
    )
    .toBe(true);
  expect(
    await page.locator("html").evaluate((el) => el.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await context.close();
});
