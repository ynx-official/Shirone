<script setup lang="ts">
import {
  DashboardOutlined,
  FileTextOutlined,
  PictureOutlined,
  FolderOutlined,
  SettingOutlined,
  MenuOutlined,
  HomeOutlined,
  ToolOutlined,
  BulbOutlined,
  TagsOutlined,
  LinkOutlined,
  AppstoreOutlined,
  CompassOutlined,
  CalendarOutlined,
  SoundOutlined,
  DesktopOutlined,
  ReadOutlined,
  CameraOutlined,
  MessageOutlined,
} from "@antdv-next/icons";
import "~/assets/styles/admin.css";
if (!useRuntimeConfig().public.mockAdmin)
  throw createError({ statusCode: 404 });
const { t, locale, localeOptions } = useCopy();
const antLocales = {
  en: () => import("antdv-next/locale/en_US"),
  zh_CN: () => import("antdv-next/locale/zh_CN"),
  zh_TW: () => import("antdv-next/locale/zh_TW"),
  ja: () => import("antdv-next/locale/ja_JP"),
  es: () => import("antdv-next/locale/es_ES"),
  id: () => import("antdv-next/locale/id_ID"),
  ko: () => import("antdv-next/locale/ko_KR"),
  th: () => import("antdv-next/locale/th_TH"),
  tr: () => import("antdv-next/locale/tr_TR"),
  vi: () => import("antdv-next/locale/vi_VN"),
};
const antLocale = shallowRef();
watch(
  locale,
  async (value) => {
    const result = await antLocales[value]();
    if (locale.value === value) antLocale.value = result.default;
  },
  { immediate: true },
);
const { theme, mode, setMode } = useAdminTheme();
const route = useRoute();
const collapsed = ref(false);
const mobileOpen = ref(false);
const tabs = ref([{ path: "/admin", label: "overview" }]);
const groups = [
  {
    label: "",
    items: [
      { key: "overview", path: "/admin", icon: DashboardOutlined },
      { key: "posts", path: "/admin/posts", icon: FileTextOutlined },
    ],
  },
  {
    label: "adminContent",
    items: ["media", "albums", "moments", "series"].map((key) => ({
      key,
      path: `/admin/${key}`,
      icon: (
        {
          media: PictureOutlined,
          albums: CameraOutlined,
          moments: MessageOutlined,
          series: ReadOutlined,
        } as Record<string, typeof PictureOutlined>
      )[key],
    })),
  },
  {
    label: "adminOrganize",
    items: [
      "friends",
      "categories",
      "tags",
      "projects",
      "compass",
      "anime",
      "skills",
      "devices",
      "games",
      "timeline",
      "music",
    ].map((key) => ({
      key,
      path: `/admin/${key}`,
      icon:
        (
          {
            friends: LinkOutlined,
            tags: TagsOutlined,
            projects: AppstoreOutlined,
            compass: CompassOutlined,
            timeline: CalendarOutlined,
            music: SoundOutlined,
            devices: DesktopOutlined,
          } as Record<string, typeof FolderOutlined>
        )[key] || FolderOutlined,
    })),
  },
  {
    label: "settings",
    items: [
      { key: "settings", path: "/admin/settings", icon: SettingOutlined },
      { key: "dataTools", path: "/admin/tools", icon: ToolOutlined },
    ],
  },
];
const currentLabel = computed(
  () =>
    groups
      .flatMap((group) => group.items)
      .find((item) => item.path === route.path)?.key || "preview",
);
watch(
  () => route.fullPath,
  (path) => {
    if (!tabs.value.some((tab) => tab.path === path))
      tabs.value.push({ path, label: currentLabel.value });
    mobileOpen.value = false;
  },
  { immediate: true },
);
async function closeTab(path: string | number | MouseEvent | KeyboardEvent) {
  const index = tabs.value.findIndex((tab) => tab.path === path);
  if (index < 0 || path === "/admin") return;
  tabs.value.splice(index, 1);
  if (route.fullPath === path)
    await navigateTo(tabs.value[Math.max(0, index - 1)]!.path);
}
useHead({
  htmlAttrs: { lang: () => locale.value.replace("_", "-") },
  title: () => `${t(currentLabel.value)} · Shirone`,
  meta: [{ name: "robots", content: "noindex,nofollow" }],
});
</script>
<template>
  <AConfigProvider :theme="theme" :locale="antLocale">
    <div
      class="admin-shell"
      :data-appearance="mode"
      :class="{
        'is-collapsed': collapsed && !mobileOpen,
        'mobile-open': mobileOpen,
      }"
    >
      <a href="#admin-content" class="admin-skip">{{ t("skipContent") }}</a>
      <aside class="admin-sidebar" :aria-label="t('navigation')">
        <NuxtLink to="/admin" class="admin-brand"
          ><span class="admin-brand-mark">S</span
          ><strong>Shirone</strong></NuxtLink
        >
        <nav :aria-label="t('manage')">
          <template v-for="group in groups" :key="group.label">
            <p v-if="group.label" class="admin-menu-group">
              {{ t(group.label) }}
            </p>
            <NuxtLink
              v-for="item in group.items"
              :key="item.key"
              :to="item.path"
              :title="t(item.key)"
              :aria-current="route.path === item.path ? 'page' : undefined"
            >
              <component :is="item.icon" aria-hidden="true" /><span>{{
                t(item.key)
              }}</span>
            </NuxtLink>
          </template>
        </nav>
        <div class="admin-sidebar-footer" :title="t('localNotice')">
          {{ t("localOnly") }}
        </div>
      </aside>
      <button
        v-if="mobileOpen"
        class="admin-backdrop"
        :aria-label="t('close')"
        @click="mobileOpen = false"
      />
      <div class="admin-workspace">
        <header class="admin-topbar">
          <AButton
            class="admin-desktop-toggle"
            type="text"
            :aria-label="t('navigation')"
            :aria-expanded="!collapsed"
            @click="collapsed = !collapsed"
            ><MenuOutlined
          /></AButton>
          <AButton
            class="admin-mobile-toggle"
            type="text"
            :aria-label="t('navigation')"
            :aria-expanded="mobileOpen"
            @click="mobileOpen = !mobileOpen"
            ><MenuOutlined
          /></AButton>
          <ABreadcrumb
            ><ABreadcrumbItem>{{ t("manage") }}</ABreadcrumbItem
            ><ABreadcrumbItem>{{
              t(currentLabel)
            }}</ABreadcrumbItem></ABreadcrumb
          >
          <div class="admin-topbar-actions">
            <AButton
              type="text"
              :aria-label="t(mode === 'light' ? 'darkMode' : 'lightMode')"
              @click="setMode(mode === 'light' ? 'dark' : 'light')"
              ><BulbOutlined
            /></AButton>
            <NuxtLink to="/" class="admin-home"
              ><HomeOutlined aria-hidden="true" /><span>{{
                t("homeLink")
              }}</span></NuxtLink
            >
            <label for="admin-locale"
              ><span class="admin-file-input">{{ t("locale") }}</span
              ><ASelect
                id="admin-locale"
                v-model:value="locale"
                :aria-label="t('locale')"
                :options="localeOptions"
                class="admin-locale"
            /></label>
          </div>
        </header>
        <nav class="admin-tabs" :aria-label="t('navigation')">
          <div
            v-for="tab in tabs"
            :key="tab.path"
            class="admin-tab"
            :class="{ active: route.fullPath === tab.path }"
          >
            <NuxtLink
              :to="tab.path"
              :aria-current="route.fullPath === tab.path ? 'page' : undefined"
              >{{ t(tab.label) }}</NuxtLink
            >
            <AButton
              v-if="tab.path !== '/admin'"
              type="text"
              size="small"
              :aria-label="`${t('close')} ${t(tab.label)}`"
              @click="closeTab(tab.path)"
              >×</AButton
            >
          </div>
        </nav>
        <main id="admin-content" class="admin-main">
          <div class="admin-content-width">
            <slot />
            <p class="admin-local-note admin-workspace-note">
              {{ t("localNotice") }}
            </p>
          </div>
        </main>
      </div>
    </div>
  </AConfigProvider>
</template>
