<script setup lang="ts">
import { themeBootstrapScript } from "~/utils/theme-bootstrap";
import SidebarWidgets from "~/components/organisms/SidebarWidgets.vue";
import RouteProgress from "~/components/organisms/RouteProgress.vue";
import SiteHeader from "~/components/organisms/SiteHeader.vue";
import SiteBanner from "~/components/organisms/SiteBanner.vue";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
const runtime = useRuntimeConfig(),
  repository = usePublicRepository(),
  route = useRoute();
const { data: site } = await useAsyncData("site", repository.site);
const { t, locale } = useCopy();
if (site.value) locale.value = site.value.lang;
const pageKey = computed(() => `page:${route.fullPath}`);
const { data: currentPage } = await useAsyncData(pageKey, () =>
  repository.page(route.path, route.query),
);
const { wallpaper, layout, texture, reduced } = useDisplay();
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem("shirone:display") || "null");
    if (saved) {
      if (["banner", "none"].includes(saved.wallpaper))
        wallpaper.value = saved.wallpaper;
      if (["list", "grid"].includes(saved.layout)) layout.value = saved.layout;
      if (
        [
          "none",
          "starlight",
          "cyber-dots",
          "topography",
          "geometric",
          "sakura",
        ].includes(saved.texture)
      )
        texture.value = saved.texture;
      reduced.value = Boolean(saved.reduced);
    }
  } catch {}
});
const dark = useState("dark", () => false);
const scrolled = useState("shell:scrolled", () => false);
const home = computed(() => currentPage.value?.kind === "home");
const title = computed(() => t(currentPage.value?.title || "search"));
const contextActions = site.value?.contextMenu
  ? defineAsyncComponent(
      () => import("~/components/organisms/ContextActions.vue"),
    )
  : undefined;
useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
    "data-texture-preset": site.value?.texture.enable ? texture.value : "none",
    class: { dark: dark.value, "motion-reduced": reduced.value },
  },
  script: [
    ...(site.value?.analytics
      ? [
          {
            src: site.value.analytics.scriptUrl,
            defer: true,
            "data-website-id": site.value.analytics.websiteId,
          },
        ]
      : []),
    {
      innerHTML: themeBootstrapScript,
    },
  ],
}));
function top() {
  window.scrollTo({
    top: 0,
    behavior:
      reduced.value || matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
  });
}
</script>
<template>
  <div
    v-if="site"
    class="public-site"
    :class="{
      'home-page': home,
      'no-banner': wallpaper === 'none',
      'layout-grid': layout === 'grid',
    }"
  >
    <div
      v-if="site.texture.enable && texture !== 'none'"
      id="m3e-texture-canvas"
      aria-hidden="true"
      :style="{ '--texture-opacity': site.texture.defaultOpacity }"
    />
    <a class="skip" href="#main">{{ t("skipContent") }}</a
    ><SiteHeader :site="site" class="onload-entry" />
    <RouteProgress
      :site="site"
      :over-banner="wallpaper !== 'none' && !scrolled"
    />
    <SiteBanner
      v-if="wallpaper !== 'none'"
      :site="site"
      :home="home"
      :title="title"
      :description="currentPage?.post?.description"
    />
    <div
      class="shell"
      :class="{
        dual: site.arrangement === 'dual',
        'no-sidebar': !site.sidebarEnabled,
      }"
    >
      <SidebarWidgets
        v-if="site.sidebarEnabled"
        :site="site"
        :toc="currentPage?.post?.toc || []"
        column="primary"
      />
      <main id="main" tabindex="-1">
        <nav
          v-if="!['tags', 'categories'].includes(currentPage?.kind || '')"
          class="category-bar onload-entry"
          :aria-label="t('categories')"
        >
          <NuxtLink
            to="/"
            class="category-pill home-pill"
            :class="{ selected: home }"
            :aria-label="t('home')"
            ><LocalIcon name="home"
          /></NuxtLink>
          <NuxtLink
            to="/archive/"
            class="category-pill"
            :class="{
              selected:
                currentPage?.kind === 'archive' && !route.query.category,
            }"
            >{{ t("archive") }}</NuxtLink
          >
          <div class="category-scroll">
            <NuxtLink
              v-for="item in site.taxonomy.categories"
              :key="item.id"
              :to="item.url"
              class="category-pill"
              :class="{
                selected: route.query.category === item.title,
                soft: currentPage?.post?.category === item.title,
              }"
              >{{ item.title }}<span>{{ item.count }}</span></NuxtLink
            >
          </div>
        </nav>
        <div class="page-entry onload-entry"><slot /></div>
        <footer class="site-footer onload-entry">
          <p>
            © {{ site.today.slice(0, 4) }} {{ site.profileName }}.
            <NuxtLink to="/rss/">RSS</NuxtLink> /
            <NuxtLink to="/atom/">Atom</NuxtLink> /
            <a href="/sitemap.xml">Sitemap</a>
          </p>
          <p>
            Nuxt &amp; Shirone
            <NuxtLink v-if="runtime.public.mockAdmin" to="/admin">
              · {{ t("manage") }}</NuxtLink
            >
          </p>
        </footer>
      </main>
      <SidebarWidgets
        v-if="site.sidebarEnabled && site.arrangement === 'dual'"
        :site="site"
        :toc="currentPage?.post?.toc || []"
        column="secondary"
      />
    </div>
    <div v-if="scrolled || currentPage?.post" class="floating-controls">
      <details v-if="currentPage?.post?.toc?.length" class="mobile-toc">
        <summary :aria-label="t('tableOfContents')">
          <LocalIcon name="words" />
        </summary>
        <nav class="panel" :aria-label="t('tableOfContents')">
          <a
            v-for="entry in currentPage.post.toc"
            :key="entry.id"
            :href="'#' + entry.id"
            >{{ entry.text }}</a
          >
        </nav>
      </details>
      <button v-if="scrolled" :aria-label="t('backToTop')" @click="top">
        <LocalIcon name="up" />
      </button>
    </div>
    <component :is="contextActions" v-if="contextActions" />
  </div>
</template>
