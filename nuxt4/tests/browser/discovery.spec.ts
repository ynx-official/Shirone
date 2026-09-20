import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
async function ready(page: Page, route: string) {
  await page.goto(`/${route}/`);
  await expect(page.locator(`[data-${route}-ready]`)).toBeVisible();
}
async function hydrated(page: Page) {
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
test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});
test("anime renders its dedicated poster collection", async ({ page }) => {
  await page.goto("/anime/");
  await expect(page.locator(".anime-section")).toHaveCount(1);
  await expect(page.locator(".anime-card")).toHaveCount(5);
  await expect(page.locator(".anime-list--grid")).toBeVisible();
});
test("compass renders grouped site tiles", async ({ page }) => {
  await page.goto("/compass/");
  await expect(page.locator(".compass-section")).toHaveCount(1);
  await expect(page.locator(".compass-shelf")).toHaveCount(4);
  await expect(page.locator(".compass-tile")).toHaveCount(11);
});

test("anime search, status, empty state and URL survive navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (/hydration/i.test(message.text())) errors.push(message.text());
  });
  await ready(page, "anime");
  const calls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/mock/page")) calls.push(r.url());
  });
  const search = page.getByRole("searchbox", { name: "搜索", exact: true });
  await search.fill("  Nexus  ");
  await expect(page.locator(".anime-card")).toHaveCount(1);
  await expect(page.locator(".anime-card__title")).toHaveText("飙速宅男");
  await expect(page.locator(".discovery-chips button")).toHaveCount(3);
  expect(calls).toEqual([]);
  await page.reload();
  await expect(page.locator(".anime-card")).toHaveCount(1);
  await expect(page.locator("[data-anime-ready]")).toBeVisible();
  await page.getByRole("button", { name: "清除", exact: true }).click();
  await page
    .locator(".discovery-chips")
    .getByRole("button", { name: "在看", exact: true })
    .click();
  await expect(page.locator(".anime-section__loading")).toBeVisible();
  await expect(page.locator(".anime-card")).toHaveCount(3);
  await expect(page.locator("[role=progressbar]")).toHaveCount(3);
  await expect(page.locator(".anime-card__progress-text").first()).toHaveText(
    "8/12",
  );
  await search.fill("2020");
  await expect(page.locator(".anime-card")).toHaveCount(1);
  await search.fill("no-such-anime");
  await expect(page.locator(".anime-section__empty")).toBeVisible();
  await expect(search).toBeVisible();
  await page.getByRole("button", { name: "清除", exact: true }).click();
  await page.locator('.topbar a[href="/"]').first().click();
  await expect(page.locator(".post-card").first()).toBeVisible();
  await page.goBack();
  await expect(page.locator(".anime-card")).toHaveCount(3);
  await expect(
    page.locator(".discovery-chips button[aria-pressed=true]"),
  ).toHaveText("在看");
  expect(errors).toEqual([]);
});

test("anime grid/list preference is independent and keyboard accessible", async ({
  page,
}) => {
  await ready(page, "anime");
  const buttons = page.locator(".anime-section__layout-btn");
  await buttons.nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".anime-list--list")).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("shirone:anime-layout-mode"),
    ),
  ).toBe("list");
  await page.reload();
  await expect(page.locator(".anime-list--list")).toBeVisible();
  await buttons.nth(0).click();
  await expect(page.locator(".anime-list--grid")).toBeVisible();
  const cover = await page.locator(".anime-card__cover").first().boundingBox();
  expect(cover!.width / cover!.height).toBeCloseTo(2 / 3, 2);
  await expect(page.locator(".anime-card__cover").first()).toHaveAttribute(
    "target",
    "_blank",
  );
  await expect(page.locator(".anime-card__cover").first()).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
});

test("compass filters nested entries by domain and group, keeps all chips", async ({
  page,
}) => {
  await ready(page, "compass");
  const calls: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/mock/page")) calls.push(r.url());
  });
  const search = page.getByRole("searchbox", { name: "搜索", exact: true });
  await search.fill("  DEVELOPER.MOZILLA.ORG  ");
  await expect(page.locator(".compass-tile")).toHaveCount(1);
  await expect(page.locator(".compass-tile__label")).toHaveText("MDN");
  await expect(page.locator(".compass-shelf")).toHaveCount(1);
  await expect(page.locator(".discovery-chips button")).toHaveCount(4);
  expect(calls).toEqual([]);
  await page.reload();
  await expect(page.locator(".compass-tile")).toHaveCount(1);
  await expect(page.locator("[data-compass-ready]")).toBeVisible();
  await page.getByRole("button", { name: "清除", exact: true }).click();
  await page.getByRole("button", { name: "设计灵感", exact: true }).click();
  await expect(page.locator(".compass-section__loading")).toBeVisible();
  await expect(page.locator(".compass-tile")).toHaveCount(3);
  await expect(page).toHaveURL(/group=design/);
  await search.fill("developer.mozilla.org");
  await expect(page.locator(".compass-section__empty")).toBeVisible();
  await search.fill("");
  await page.getByRole("button", { name: "设计灵感", exact: true }).click();
  await expect(page.locator(".compass-tile")).toHaveCount(11);
  expect(
    await page
      .locator(".compass-section svg")
      .evaluateAll((es) => es.filter((e) => !e.innerHTML.trim()).length),
  ).toBe(0);
  await expect(
    page
      .locator(".compass-section")
      .getByRole("link", { name: /GitHub/ })
      .first(),
  ).toHaveAttribute("href", "https://github.com");
});

test("SSR search and nested group filtering work without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto("/anime/?status=watching&q=2020");
  await expect(page.locator(".anime-card")).toHaveCount(1);
  await expect(page.locator(".anime-card__title")).toHaveText("恋爱小行星");
  await page.goto("/compass/?group=dev&q=mozilla");
  await expect(page.locator(".compass-tile")).toHaveCount(1);
  await expect(page.locator(".compass-tile__label")).toHaveText("MDN");
  await page.goto("/compass/?group=design&q=mozilla");
  await expect(page.locator(".compass-section__empty")).toBeVisible();
  await expect(page.getByRole("searchbox")).toBeVisible();
  await context.close();
});

test("anime twelve-item batches reset after filters; missing media has a fallback", async ({
  page,
}) => {
  await page.route("**/api/mock/page?**", async (route) => {
    if (new URL(route.request().url()).searchParams.get("path") !== "/anime/") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    const data = await response.json();
    const seed = data.items[0];
    data.items.push(
      ...Array.from({ length: 14 }, (_, i) => ({
        ...seed,
        id: `fixture-${i}`,
        data: {
          ...seed.data,
          title: `Fixture ${i}`,
          cover: undefined,
          link: undefined,
          status: "onHold",
        },
      })),
    );
    data.total = data.items.length;
    await route.fulfill({ response, json: data });
  });
  await page.goto("/");
  await hydrated(page);
  await page.locator('.topbar a[href="/anime/"]').click();
  await expect(page.locator("[data-anime-ready]")).toBeVisible();
  await expect(page.locator(".anime-card")).toHaveCount(12);
  await page.getByRole("button", { name: "加载更多", exact: true }).click();
  await expect(page.locator(".anime-card")).toHaveCount(19);
  await expect(
    page.getByRole("button", { name: "加载更多", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("div.anime-card__cover")).toHaveCount(14);
  await expect(page.locator(".anime-card__placeholder")).toHaveCount(14);
  await page.getByRole("searchbox").fill("Nexus");
  await expect(page.locator(".anime-card")).toHaveCount(1);
  await page.getByRole("button", { name: "清除", exact: true }).click();
  await expect(page.locator(".anime-card")).toHaveCount(12);
});

test("compass image failure falls back to a letter and missing note shows hostname", async ({
  page,
}) => {
  await page.route("**/api/mock/page?**", async (route) => {
    if (
      new URL(route.request().url()).searchParams.get("path") !== "/compass/"
    ) {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    const data = await response.json();
    data.items[0].data.entries[0] = {
      label: "Example",
      href: "https://www.example.com",
      image: "/missing-compass-test.png",
    };
    await route.fulfill({ response, json: data });
  });
  await page.route("**/missing-compass-test.png", (route) => route.abort());
  await page.goto("/");
  await hydrated(page);
  await page.locator('.topbar a[href="/compass/"]').click();
  await expect(page.locator("[data-compass-ready]")).toBeVisible();
  const tile = page.locator(".compass-tile").filter({ hasText: "Example" });
  await expect(tile.locator(".compass-tile__letter")).toHaveText("E");
  await expect(tile.locator(".compass-tile__note")).toHaveText("example.com");
  await expect(tile.locator("img")).toHaveCount(0);
});

test("anime layout remains usable when browser storage is blocked", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const get = Storage.prototype.getItem,
      set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "shirone:anime-layout-mode") throw new Error("blocked");
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "shirone:anime-layout-mode") throw new Error("blocked");
      return set.call(this, key, value);
    };
  });
  await ready(page, "anime");
  await page.locator(".anime-section__layout-btn").nth(1).click();
  await expect(page.locator(".anime-list--list")).toBeVisible();
  await page.reload();
  await expect(page.locator(".anime-list--grid")).toBeVisible();
});

test("desktop/mobile themes, both anime layouts and reduced motion pass accessibility", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["anime", "compass"]) {
    await ready(page, route);
    await hydrated(page);
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
          (
            await new AxeBuilder({ page })
              .include(`.${route}-section`)
              .analyze()
          ).violations,
        ).toEqual([]);
        if (route === "anime") {
          const card = await page.locator(".anime-card").first().boundingBox();
          expect(card!.width).toBeCloseTo(width === 390 ? 146.375 : 172.25, 1);
          const icon = await page
            .locator(".anime-section__layout-btn svg")
            .first()
            .boundingBox();
          expect(icon!.width).toBeGreaterThanOrEqual(17);
          await page.locator(".anime-section__layout-btn").nth(1).click();
          expect(
            (await new AxeBuilder({ page }).include(".anime-section").analyze())
              .violations,
          ).toEqual([]);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          await page.locator(".anime-section__layout-btn").nth(0).click();
        }
      }
    }
    await page.locator(".discovery-chips button").first().click();
    await expect(page.locator(`.${route}-section__loading`)).toHaveCount(0);
  }
});
