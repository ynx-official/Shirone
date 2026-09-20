import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});
async function hydrated(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => {
    const root = document.querySelector("#__nuxt") as Element & {
      __vue_app__?: {
        config: { globalProperties: { $nuxt?: { isHydrating: boolean } } };
      };
    };
    return (
      root?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false
    );
  });
}

test("load more uses ten-item batches and filters reset the batch", async ({
  page,
}) => {
  await page.route("**/api/mock/page?**", async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("path") !== "/moments/"
    ) {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    const data = await response.json();
    const seed = data.items.find(
      (item: { id: string }) => item.id === "2026-07-27-reading",
    );
    data.items.push(
      ...Array.from({ length: 11 }, (_, i) => ({
        ...seed,
        id: `fixture-${i}`,
        data: { ...seed.data, pinned: false },
      })),
    );
    data.total = data.items.length;
    await route.fulfill({ response, json: data });
  });
  await page.goto("/");
  await hydrated(page);
  await page.locator('.topbar a[href="/moments/"]').click();
  await expect(page.locator("[data-moments-ready]")).toBeVisible();
  await expect(page.locator(".moment-card")).toHaveCount(10);
  await page.getByRole("button", { name: "加载更多", exact: true }).click();
  await expect(page.locator(".moment-card")).toHaveCount(17);
  await expect(
    page.getByRole("button", { name: "加载更多", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("searchbox", { name: "搜索", exact: true })
    .fill("书桌前");
  await expect(page.locator(".moment-card")).toHaveCount(1);
  await page.getByRole("button", { name: "清除", exact: true }).click();
  await expect(page.locator(".moment-card")).toHaveCount(10);
});

test("lightbox is destroyed on navigation and English controls use translations", async ({
  page,
}) => {
  await page.goto("/");
  await hydrated(page);
  await page.locator('.topbar a[href="/moments/"]').click();
  await expect(page.locator("[data-moments-ready]")).toBeVisible();
  await page
    .getByRole("combobox", { name: "语言", exact: true })
    .selectOption("en");
  await page
    .locator("#moment-2026-08-12-riverside .moment-card__tile")
    .first()
    .click();
  const viewer = page.getByRole("group", { name: "Image viewer", exact: true });
  await expect(
    viewer.getByRole("button", { name: "Back to grid", exact: true }),
  ).toBeVisible();
  await viewer.locator(".moment-viewer__stage-btn").click();
  await expect(page.locator(".fancybox__container")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".post-card").first()).toBeVisible();
  await expect(page.locator(".fancybox__container")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/with-fancybox/);
});
async function ready(page: import("@playwright/test").Page) {
  await page.goto("/moments/");
  await expect(page.locator(".moments-section")).toHaveCount(1);
  await expect(page.locator("[data-moments-ready]")).toBeVisible();
}
test("inline image loading indicator clears after a delayed image arrives", async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(
    "**/images/moments/girls-trio/girl-1.webp",
    async (route) => {
      await pending;
      await route.continue();
    },
  );
  try {
    await ready(page);
    await page
      .locator("#moment-2026-08-12-riverside .moment-card__tile")
      .first()
      .click();
    const stage = page.locator(".moment-viewer__stage-btn");
    await expect(stage.locator(".moment-image-loading")).toBeVisible();
    release();
    await expect(stage.locator(".moment-image-loading")).toHaveCount(0);
    await expect(stage.locator("img")).toBeVisible();
    expect(
      await stage
        .locator("img")
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    ).toBeGreaterThan(0);
  } finally {
    release();
  }
});
test("one stream, pinned-first ordering, site time and complete icons", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (/hydration/i.test(m.text())) errors.push(m.text());
  });
  await ready(page);
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main input[type=search]")).toHaveCount(1);
  await expect(page.locator(".moment-card")).toHaveCount(6);
  await expect(page.locator(".moment-card").first()).toHaveAttribute(
    "id",
    "moment-2026-08-15-welcome",
  );
  await expect(page.locator(".moment-card").first().locator("time")).toHaveText(
    "2026-08-15 10:00",
  );
  await expect(page.locator(".moment-card").nth(1)).toHaveAttribute(
    "id",
    "moment-2026-08-12-riverside",
  );
  expect(
    await page
      .locator(".moments-section svg")
      .evaluateAll((es) => es.filter((e) => !e.innerHTML.trim()).length),
  ).toBe(0);
  expect(errors).toEqual([]);
});
test("instant search keeps all tags, URL, empty state and back navigation", async ({
  page,
}) => {
  await ready(page);
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/mock/page")) requests.push(r.url());
  });
  const search = page.getByRole("searchbox", { name: "搜索", exact: true });
  await search.fill("  代码  ");
  await expect(page.locator(".moment-card")).toHaveCount(2);
  await expect(page.locator(".moments-chips button")).toHaveCount(6);
  await expect
    .poll(() => new URL(page.url()).searchParams.get("q"))
    .toBe("  代码  ");
  expect(requests).toEqual([]);
  await page.reload();
  await expect(page.locator(".moment-card")).toHaveCount(2);
  await expect(page.locator("[data-moments-ready]")).toBeVisible();
  await search.fill("书桌前");
  await expect(page.locator(".moment-card")).toHaveCount(1);
  await search.fill("no-such-moment");
  await expect(page.locator(".moments-empty")).toBeVisible();
  await expect(search).toBeVisible();
  await page.getByRole("button", { name: "清除", exact: true }).click();
  await page
    .locator(".moments-chips")
    .getByRole("button", { name: "壁纸", exact: true })
    .click();
  await expect(page.locator(".moment-card")).toHaveCount(3);
  await expect
    .poll(() => new URL(page.url()).searchParams.get("tag"))
    .toBe("壁纸");
  await page.locator('.topbar a[href="/"]').first().click();
  await expect(page.locator(".post-card").first()).toBeVisible();
  await page.goBack();
  await expect(page.locator(".moment-card")).toHaveCount(3);
  await expect(
    page.locator(".moments-chips button[aria-pressed=true]"),
  ).toHaveText("壁纸");
});
test("grid geometry, inline viewer keyboard/focus and on-demand lightbox", async ({
  page,
}) => {
  const loads: string[] = [];
  page.on("request", (r) => loads.push(r.url()));
  await ready(page);
  expect(loads.some((url) => /album-viewer|fancybox/i.test(url))).toBe(false);
  const card = page.locator("#moment-2026-08-12-riverside");
  const tiles = card.locator(".moment-card__tile");
  const big = await tiles.nth(0).boundingBox(),
    small = await tiles.nth(1).boundingBox();
  expect(big!.width / small!.width).toBeCloseTo(2, 1);
  await tiles.nth(1).click();
  const viewer = card.locator(".moment-viewer");
  await expect(viewer).toBeFocused();
  await page.keyboard.press("End");
  await expect(viewer.locator(".moment-viewer__counter")).toHaveText("3 / 3");
  await expect(
    viewer.getByRole("button", { name: "下一张", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Home");
  await expect(viewer.locator(".moment-viewer__counter")).toHaveText("1 / 3");
  await page.keyboard.press("ArrowRight");
  await expect(viewer.locator(".moment-viewer__counter")).toHaveText("2 / 3");
  await viewer.locator(".moment-viewer__stage-btn").click();
  await expect(page.locator(".fancybox__container")).toBeVisible();
  expect(loads.some((url) => /album-viewer|fancybox/i.test(url))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator(".fancybox__container")).toHaveCount(0);
  await expect(viewer.locator(".moment-viewer__stage-btn")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(viewer).toHaveCount(0);
  await expect(tiles.nth(1)).toBeFocused();
  await page
    .locator("#moment-2026-08-08-late-night-coding .moment-card__tile")
    .click();
  await expect(page.locator(".fancybox__container")).toBeVisible();
  await page.keyboard.press("Escape");
});
test("SSR filtering and native image links work without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/moments/?q=书桌前`);
  await expect(page.locator(".moment-card")).toHaveCount(1);
  await expect(page.locator(".moment-card__tile")).toHaveCount(6);
  await expect(page.locator(".moment-card__tile").first()).toHaveAttribute(
    "href",
    /roll-1.webp/,
  );
  await page.goto(`${baseURL}/moments/?q=no-such-moment`);
  await expect(page.locator(".moments-empty")).toBeVisible();
  await context.close();
});
test("desktop/mobile light/dark accessibility and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const dark of [true, false]) {
      await page.emulateMedia({ colorScheme: dark ? "dark" : "light" });
      await page.waitForFunction((value) => {
        const cache = JSON.parse(
          localStorage.getItem("shirone:palette-cache:v1") || "null",
        );
        return cache && JSON.parse(cache.key)[3] === value;
      }, dark);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).include(".moments-section").analyze())
          .violations,
      ).toEqual([]);
    }
  }
  await page
    .locator(".moments-chips")
    .getByRole("button", { name: "壁纸", exact: true })
    .click();
  await expect(page.locator(".moments-loading")).toHaveCount(0);
  await page.locator(".moment-card__tile").first().click();
  expect(
    (await new AxeBuilder({ page }).include(".moment-viewer").analyze())
      .violations,
  ).toEqual([]);
});
