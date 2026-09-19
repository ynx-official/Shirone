<script setup lang="ts">
import type { Site } from "#shared/types/content";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
defineProps<{ site: Site }>();
const { t } = useCopy();
const route = useRoute();
const { toggle, ready } = useTheme();
const settings = defineAsyncComponent(
  () => import("~/components/organisms/DisplaySettings.vue"),
);
const menu = ref(false),
  display = ref(false),
  openGroup = ref(""),
  scrolled = useState("shell:scrolled", () => false);
const panel = ref<HTMLElement>();
function scroll() {
  scrolled.value =
    window.scrollY > Math.max(32, window.innerHeight * 0.65 - 64);
}
function outside(e: MouseEvent) {
  if (!panel.value?.contains(e.target as Node)) {
    menu.value = false;
    display.value = false;
    openGroup.value = "";
  }
}
function close() {
  menu.value = false;
  display.value = false;
  openGroup.value = "";
}
watch(() => route.fullPath, close);
onMounted(() => {
  scroll();
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", scroll);
  document.addEventListener("click", outside);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", scroll);
  window.removeEventListener("resize", scroll);
  document.removeEventListener("click", outside);
});
</script>
<template>
  <header
    ref="panel"
    class="topbar"
    :class="{ 'is-scrolled': scrolled }"
    @keydown.esc="close"
  >
    <div class="topbar-inner">
      <button
        class="icon-button drawer-toggle"
        :aria-label="t('navigation')"
        :aria-expanded="menu"
        @click="
          menu = !menu;
          display = false;
        "
      >
        <LocalIcon name="menu" />
      </button>
      <NuxtLink to="/" class="brand"
        ><span class="brand-accent" />{{ site.title }}</NuxtLink
      >
      <nav class="desktop-navigation" :aria-label="t('navigation')">
        <div v-for="entry in site.links" :key="entry.label" class="nav-group">
          <button
            v-if="entry.children"
            :aria-expanded="openGroup === entry.label"
            class="nav-link"
            @click="openGroup = openGroup === entry.label ? '' : entry.label"
          >
            <LocalIcon :name="entry.icon || 'material-symbols:apps'" />{{
              t(entry.label)
            }}<LocalIcon name="down" />
          </button>
          <NuxtLink v-else :to="entry.url" class="nav-link"
            ><LocalIcon :name="entry.icon" />{{ t(entry.label) }}</NuxtLink
          >
          <div
            v-if="entry.children && openGroup === entry.label"
            class="nav-dropdown"
          >
            <NuxtLink
              v-for="child in entry.children"
              :key="child.label"
              :to="child.url"
              :external="child.external"
              ><LocalIcon :name="child.icon" />{{ t(child.label) }}</NuxtLink
            >
          </div>
        </div>
      </nav>
      <div class="header-actions">
        <NuxtLink to="/search/" class="icon-button" :aria-label="t('search')"
          ><LocalIcon name="search" /></NuxtLink
        ><button
          v-if="!site.themeColor.fixed"
          class="icon-button"
          :aria-label="t('themeColor')"
          :aria-expanded="display"
          @click="
            display = !display;
            menu = false;
          "
        >
          <LocalIcon name="palette" /></button
        ><button
          class="icon-button"
          :aria-label="t('theme')"
          :disabled="!ready"
          @click="toggle"
        >
          <LocalIcon name="theme" />
        </button>
      </div>
    </div>
    <component :is="settings" v-if="display" />
    <nav v-if="menu" class="mobile-nav" :aria-label="t('navigation')">
      <template v-for="entry in site.links" :key="entry.label"
        ><NuxtLink v-if="entry.url" :to="entry.url"
          ><LocalIcon :name="entry.icon" />{{ t(entry.label) }}</NuxtLink
        ><template v-else
          ><h2>{{ t(entry.label) }}</h2>
          <NuxtLink
            v-for="child in entry.children"
            :key="child.label"
            :to="child.url"
            :external="child.external"
            ><LocalIcon :name="child.icon" />{{ t(child.label) }}</NuxtLink
          ></template
        ></template
      >
    </nav>
  </header>
</template>
