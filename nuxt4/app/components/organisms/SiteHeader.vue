<script setup lang="ts">
import type { Site, NavigationLink } from "#shared/types/content";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
defineProps<{ site: Site }>();
const { t, locale, localeOptions } = useCopy();
function navLabel(link: NavigationLink) {
  const translated = t(link.label);
  return translated === link.label ? link.name || translated : translated;
}
const route = useRoute();
const { mode, setMode, ready } = useTheme(true);
const themeMenu = ref(false);
const themeOptions = [
  {
    value: "light",
    label: "lightMode",
    icon: "material-symbols:wb-sunny-outline-rounded",
  },
  {
    value: "dark",
    label: "darkMode",
    icon: "material-symbols:dark-mode-outline-rounded",
  },
  {
    value: "auto",
    label: "systemMode",
    icon: "material-symbols:radio-button-partial-outline",
  },
] as const;
const themeIcon = computed(
  () => themeOptions.find((item) => item.value === mode.value)!.icon,
);
function openTheme() {
  display.value = false;
  openGroup.value = "";
  if (matchMedia("(min-width:1024px)").matches)
    themeMenu.value = !themeMenu.value;
  else
    void setMode(
      mode.value === "light"
        ? "dark"
        : mode.value === "dark"
          ? "auto"
          : "light",
    );
}
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
    themeMenu.value = false;
    menu.value = false;
    display.value = false;
    openGroup.value = "";
  }
}
function close() {
  themeMenu.value = false;
  menu.value = false;
  display.value = false;
  openGroup.value = "";
}
function escape() {
  const trigger = panel.value?.querySelector<HTMLButtonElement>(
    'button[aria-expanded="true"]',
  );
  close();
  trigger?.focus();
}
function documentKey(event: KeyboardEvent) {
  if (
    event.key === "Escape" &&
    (display.value || menu.value || themeMenu.value || openGroup.value)
  ) {
    event.preventDefault();
    escape();
  }
}
function enter(event: PointerEvent, label: string) {
  if (event.pointerType === "mouse") {
    openGroup.value = label;
    display.value = false;
    themeMenu.value = false;
  }
}
function leave(event: PointerEvent) {
  if (event.pointerType === "mouse") openGroup.value = "";
}
function activateGroup(event: MouseEvent, label: string) {
  openGroup.value =
    event.detail > 0 ? label : openGroup.value === label ? "" : label;
}
function blurGroup(event: FocusEvent) {
  if (
    !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)
  )
    openGroup.value = "";
}
function focusFirst(event: KeyboardEvent) {
  const group = (event.currentTarget as HTMLElement).closest(".nav-group");
  openGroup.value = group?.getAttribute("data-group") || "";
  nextTick(() =>
    group?.querySelector<HTMLAnchorElement>(".nav-dropdown a")?.focus(),
  );
}
watch(() => route.fullPath, close);
onMounted(() => {
  scroll();
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("resize", scroll);
  document.addEventListener("click", outside);
  document.addEventListener("keydown", documentKey);
});
onBeforeUnmount(() => {
  window.removeEventListener("scroll", scroll);
  window.removeEventListener("resize", scroll);
  document.removeEventListener("click", outside);
  document.removeEventListener("keydown", documentKey);
});
</script>
<template>
  <header
    ref="panel"
    class="topbar"
    :class="{ 'is-scrolled': scrolled }"
    @keydown.esc.stop.prevent="escape"
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
        <div
          v-for="entry in site.links"
          :key="entry.label"
          class="nav-group"
          :data-group="entry.label"
          @pointerenter="entry.children && enter($event, entry.label)"
          @pointerleave="leave"
          @focusout="blurGroup"
        >
          <button
            v-if="entry.children"
            :aria-expanded="openGroup === entry.label"
            class="nav-link"
            aria-haspopup="true"
            @keydown.down.prevent="focusFirst"
            @click="activateGroup($event, entry.label)"
          >
            <LocalIcon :name="entry.icon || 'material-symbols:apps'" />{{
              navLabel(entry)
            }}<LocalIcon name="down" />
          </button>
          <NuxtLink v-else :to="entry.url" class="nav-link"
            ><LocalIcon :name="entry.icon" />{{ navLabel(entry) }}</NuxtLink
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
              :target="child.external ? '_blank' : undefined"
              :rel="child.external ? 'noopener noreferrer' : undefined"
              :class="{ 'external-link': child.external }"
              ><LocalIcon :name="child.icon" />{{ navLabel(child)
              }}<LocalIcon
                v-if="child.external"
                class="external-arrow"
                name="material-symbols:arrow-outward-rounded"
            /></NuxtLink>
          </div>
        </div>
      </nav>
      <div class="header-actions">
        <label class="language-control icon-button" :title="t('locale')">
          <LocalIcon name="material-symbols:translate-rounded" />
          <select
            v-model="locale"
            :aria-label="t('locale')"
            @pointerdown="close"
            @keydown="close"
          >
            <option
              v-for="option in localeOptions"
              :key="option.value"
              :value="option.value"
              :lang="option.lang"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
        <NuxtLink to="/search/" class="icon-button" :aria-label="t('search')"
          ><LocalIcon name="search" /></NuxtLink
        ><button
          v-if="!site.themeColor.fixed"
          class="icon-button"
          :aria-label="t('themeColor')"
          :aria-expanded="display"
          @click="
            themeMenu = false;
            openGroup = '';
            display = !display;
            menu = false;
          "
        >
          <LocalIcon name="palette" /></button
        ><button
          class="icon-button"
          :aria-label="t('theme')"
          :disabled="!ready"
          :aria-expanded="themeMenu"
          aria-haspopup="true"
          @click="openTheme"
        >
          <LocalIcon :name="themeIcon" />
        </button>
      </div>
    </div>
    <div v-if="themeMenu" class="theme-mode-menu">
      <button
        v-for="option in themeOptions"
        :key="option.value"
        :aria-pressed="mode === option.value"
        @click="
          setMode(option.value);
          themeMenu = false;
        "
      >
        <LocalIcon :name="option.icon" />{{ t(option.label) }}
      </button>
    </div>
    <component :is="settings" v-if="display" />
    <nav v-if="menu" class="mobile-nav" :aria-label="t('navigation')">
      <template v-for="entry in site.links" :key="entry.label"
        ><NuxtLink v-if="entry.url" :to="entry.url"
          ><LocalIcon :name="entry.icon" />{{ navLabel(entry) }}</NuxtLink
        ><template v-else
          ><h2>{{ navLabel(entry) }}</h2>
          <NuxtLink
            v-for="child in entry.children"
            :key="child.label"
            :to="child.url"
            :external="child.external"
            :target="child.external ? '_blank' : undefined"
            :rel="child.external ? 'noopener noreferrer' : undefined"
            :class="{ 'external-link': child.external }"
            ><LocalIcon :name="child.icon" />{{ navLabel(child)
            }}<LocalIcon
              v-if="child.external"
              class="external-arrow"
              name="material-symbols:arrow-outward-rounded" /></NuxtLink></template
      ></template>
    </nav>
  </header>
</template>
