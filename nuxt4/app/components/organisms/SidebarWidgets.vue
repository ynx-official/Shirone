<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import CalendarWidget from "~/components/organisms/CalendarWidget.vue";
import type { Site } from "#shared/types/content";
const props = defineProps<{
  site: Site;
  column: "primary" | "secondary";
  toc: { id: string; text: string; depth: number }[];
}>();
const route = useRoute();
const { t } = useCopy();
const hidden = ref(false);
const page = computed(() => {
  const first = route.path.split("/").filter(Boolean)[0];
  return !first || /^\d+$/.test(first)
    ? "home"
    : props.site.pages.includes(first)
      ? first
      : "post";
});
const widgets = computed(() =>
  props.site.widgets.filter(
    (w) =>
      w.enable &&
      (w.column || "primary") === props.column &&
      (!w.pages?.length || w.pages.includes(page.value)),
  ),
);
function stickyIndex(index: number) {
  return widgets.value
    .slice(0, index)
    .filter((widget) => widget.slot === "sticky").length;
}
const stats = computed(() => [
  ["statsPosts", "words", props.site.stats.posts],
  [
    "moments",
    "material-symbols:forum-outline-rounded",
    props.site.stats.moments,
  ],
  [
    "categories",
    "material-symbols:folder-outline-rounded",
    props.site.stats.categories,
  ],
  ["tags", "tag", props.site.stats.tags],
  [
    "series",
    "material-symbols:auto-stories-outline-rounded",
    props.site.stats.series,
  ],
  [
    "statsWords",
    "material-symbols:edit-note-rounded",
    props.site.stats.words.toLocaleString(),
  ],
  [
    "statsDays",
    "material-symbols:calendar-month-outline-rounded",
    props.site.stats.days.toLocaleString(),
  ],
  ["statsUpdated", "date", props.site.stats.updated],
]);
const lastUpdated = computed(() => {
  const days = Math.max(
    0,
    Math.floor(
      (Date.parse(props.site.today) - Date.parse(props.site.stats.updated)) /
        86400000,
    ),
  );
  return days === 0
    ? t("statsToday")
    : days === 1
      ? t("statsYesterday")
      : t("statsDaysAgo").replace("{days}", String(days));
});
const activeHeading = ref(props.toc[0]?.id || "");
let observer: IntersectionObserver | undefined;
async function observeHeadings() {
  observer?.disconnect();
  activeHeading.value = props.toc[0]?.id || "";
  if (props.column !== "secondary" || !props.toc.length) return;
  await nextTick();
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) activeHeading.value = entry.target.id;
    },
    { rootMargin: "-80px 0px -65% 0px" },
  );
  for (const heading of props.toc) {
    const element = document.getElementById(heading.id);
    if (element) observer.observe(element);
  }
}
onMounted(observeHeadings);
watch(
  () => props.toc,
  () => {
    if (import.meta.client) void observeHeadings();
  },
);
onBeforeUnmount(() => observer?.disconnect());
const player = props.site.music
  ? defineAsyncComponent(() => import("~/components/organisms/MusicPlayer.vue"))
  : undefined;
</script>
<template>
  <aside
    class="sidebar onload-entry"
    :class="{ 'secondary-sidebar': column === 'secondary' }"
  >
    <template v-for="(widget, i) in widgets" :key="`${widget.type}-${i}`"
      ><section
        v-if="widget.type === 'profile'"
        :style="{ '--entry-index': stickyIndex(i) }"
        :class="{ 'onload-entry': widget.slot === 'sticky' }"
        class="panel profile"
      >
        <NuxtLink to="/about/" class="profile-avatar" :aria-label="t('about')"
          ><img
            :src="site.avatar"
            :srcset="site.avatarSrcset"
            sizes="112px"
            alt=""
            width="256"
            height="256"
            loading="lazy"
        /></NuxtLink>
        <h2>{{ site.profileName }}</h2>
        <div class="profile-accent" />
        <p class="muted">{{ site.bio }}</p>
        <div class="profile-socials">
          <a
            v-for="link in site.profileLinks"
            :key="link.url"
            :href="link.url"
            :aria-label="link.name"
            rel="noopener noreferrer"
            ><LocalIcon :name="link.icon"
          /></a>
        </div>
      </section>
      <section
        v-else-if="widget.type === 'announcement' && !hidden"
        :style="{ '--entry-index': stickyIndex(i) }"
        :class="{ 'onload-entry': widget.slot === 'sticky' }"
        class="panel"
      >
        <div class="row">
          <h2>{{ t("announcement") }}</h2>
          <button :aria-label="t('close')" @click="hidden = true">×</button>
        </div>
        <p>{{ site.announcement.content }}</p>
        <a
          v-if="site.announcement.link?.enable"
          :href="site.announcement.link.url"
          rel="noopener noreferrer"
          >{{ site.announcement.link.text }} ↗</a
        >
      </section>
      <section
        v-else-if="site.taxonomy[widget.type]"
        :style="{ '--entry-index': stickyIndex(i) }"
        :class="{ 'onload-entry': widget.slot === 'sticky' }"
        class="panel"
      >
        <h2>{{ t(widget.type) }}</h2>
        <div
          :class="widget.type === 'tags' ? 'row widget-tags' : 'widget-rows'"
        >
          <NuxtLink
            v-for="item in site.taxonomy[widget.type]?.slice(
              0,
              widget.collapseAfter || 10,
            )"
            :key="item.id"
            :class="{ chip: widget.type === 'tags' }"
            :to="item.url"
            >{{ item.title
            }}<span v-if="widget.type !== 'tags'" class="widget-count">{{
              item.count
            }}</span></NuxtLink
          >
        </div>
      </section>
      <section
        v-else-if="widget.type === 'stats'"
        :style="{ '--entry-index': stickyIndex(i) }"
        :class="{ 'onload-entry': widget.slot === 'sticky' }"
        class="panel"
      >
        <h2>{{ t("stats") }}</h2>
        <div
          v-for="[label, icon, value] in stats"
          :key="String(label)"
          class="stats-row"
        >
          <span class="meta-icon"><LocalIcon :name="String(icon)" /></span
          ><span>{{ t(String(label)) }}</span
          ><span class="stats-rule" /><span>{{
            label === "statsUpdated" ? lastUpdated : value
          }}</span>
        </div>
      </section>
      <CalendarWidget
        v-else-if="widget.type === 'calendar'"
        :class="{ 'onload-entry': widget.slot === 'sticky' }"
        :style="{ '--entry-index': stickyIndex(i) }"
        :dates="site.stats.dates"
        :today="site.today" />
      <nav
        v-else-if="widget.type === 'toc' && toc.length"
        :style="{ '--entry-index': stickyIndex(i) }"
        :class="{ 'onload-entry': widget.slot === 'sticky' }"
        class="panel toc"
        :aria-label="t('tableOfContents')"
      >
        <h2>{{ t("tableOfContents") }}</h2>
        <a
          v-for="item in toc"
          :key="item.id"
          :href="'#' + item.id"
          :aria-current="activeHeading === item.id ? 'location' : undefined"
          :style="{
            paddingLeft: `${0.5 + Math.max(0, item.depth - 1) * 0.5}rem`,
          }"
          >{{ item.text }}</a
        >
      </nav>
      <component
        :is="player"
        v-else-if="widget.type === 'music' && player && site.music"
        :class="{ 'onload-entry': widget.slot === 'sticky' }"
        :style="{ '--entry-index': stickyIndex(i) }"
        :config="site.music"
    /></template>
  </aside>
</template>
