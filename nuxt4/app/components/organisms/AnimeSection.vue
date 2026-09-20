<script setup lang="ts">
import AnimeCard from "~/components/molecules/AnimeCard.vue";
import DiscoveryHeading from "~/components/molecules/DiscoveryHeading.vue";
import DiscoverySearch from "~/components/molecules/DiscoverySearch.vue";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import FilterLoading from "~/components/atoms/FriendFilterLoading.vue";
import type { Entity } from "#shared/types/content";
import type { AnimeData } from "#shared/types/discovery";
import { animeStatus } from "~/utils/anime-status";
import "~/assets/styles/discovery.css";
const props = defineProps<{ items: Entity[] }>();
const { t } = useCopy();
const route = useRoute();
const { query, selected, phase, hydrated, reduced, sync, select } =
  useDiscoveryFilter("status");
const rows = computed(() =>
  props.items.map((item) => ({ id: item.id, anime: item.data as AnimeData })),
);
const statuses = computed(() => [
  ...new Set(rows.value.map(({ anime }) => anime.status)),
]);
const filtered = computed(() =>
  rows.value.filter(
    ({ anime }) =>
      (!selected.value || anime.status === selected.value) &&
      (!query.value.trim() ||
        [
          anime.title,
          anime.description || "",
          anime.studio || "",
          anime.year,
          ...anime.genres,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.value.trim().toLowerCase())),
  ),
);
const shown = ref(12),
  mode = ref<"grid" | "list">("grid"),
  list = ref<HTMLElement>();
const animations = new Set<Animation>();
let disposed = false;
onMounted(() => {
  try {
    const value = localStorage.getItem("shirone:anime-layout-mode");
    if (value === "list" || value === "grid") mode.value = value;
  } catch {}
});
onBeforeUnmount(() => {
  disposed = true;
  animations.forEach((animation) => animation.cancel());
});
watch([query, selected], () => {
  shown.value = 12;
});
async function setLayout(value: "grid" | "list") {
  if (value === mode.value) return;
  const cards = [
    ...(list.value?.querySelectorAll<HTMLElement>(".anime-card") || []),
  ];
  const before = cards.map((card) => card.getBoundingClientRect());
  mode.value = value;
  try {
    localStorage.setItem("shirone:anime-layout-mode", value);
  } catch {}
  await nextTick();
  if (disposed || reduced()) return;
  cards.forEach((card, i) => {
    const after = card.getBoundingClientRect();
    const animation = card.animate(
      [
        {
          transform: `translate(${before[i]!.left - after.left}px,${before[i]!.top - after.top}px)`,
        },
        { transform: "translate(0,0)" },
      ],
      { duration: 400, easing: "cubic-bezier(0.05,0.7,0.1,1)" },
    );
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
  });
}
</script>
<template>
  <section
    class="panel anime-section"
    :data-anime-ready="hydrated || undefined"
  >
    <DiscoveryHeading
      :title="t('anime')"
      :subtitle="t('animeBanner')"
      icon="material-symbols:live-tv-outline-rounded"
    />
    <form
      v-if="items.length"
      class="anime-section__tools"
      :action="route.path"
      method="get"
      @submit.prevent="sync"
    >
      <div class="anime-section__search-row">
        <DiscoverySearch
          v-model="query"
          class="anime-section__search"
          @change="sync"
        />
        <div
          class="anime-section__layout-switch"
          role="group"
          :aria-label="t('layoutMode')"
        >
          <button
            v-for="layout in ['grid', 'list'] as const"
            :key="layout"
            type="button"
            class="anime-section__layout-btn"
            :class="{ 'anime-section__layout-btn--active': mode === layout }"
            :aria-label="t(layout === 'grid' ? 'layoutGrid' : 'layoutList')"
            :aria-pressed="mode === layout"
            @click="setLayout(layout)"
          >
            <LocalIcon
              :name="
                layout === 'grid'
                  ? 'material-symbols:grid-view-rounded'
                  : 'material-symbols:view-list-rounded'
              "
            />
          </button>
        </div>
      </div>
      <input v-if="selected" type="hidden" name="status" :value="selected" />
      <div class="anime-section__filter-row">
        <div
          v-if="statuses.length > 1"
          class="anime-section__chips discovery-chips"
        >
          <button
            v-for="status in statuses"
            :key="status"
            type="button"
            :aria-pressed="selected === status"
            @click="select(status)"
          >
            <LocalIcon
              :name="
                selected === status
                  ? 'material-symbols:check-rounded'
                  : animeStatus[status].icon
              "
            />{{ t(animeStatus[status].key) }}
          </button>
        </div>
        <p v-if="filtered.length" class="anime-section__count" role="status">
          {{ filtered.length }} {{ t("animeCounts") }}
        </p>
      </div>
    </form>
    <div
      v-if="phase !== 'idle'"
      class="anime-section__loading"
      :class="{ 'anime-section__loading--out': phase === 'out' }"
      aria-busy="true"
    >
      <FilterLoading />
    </div>
    <template v-else-if="filtered.length"
      ><div
        :key="`${query}|${selected}`"
        ref="list"
        class="anime-list"
        :class="`anime-list--${mode}`"
      >
        <AnimeCard
          v-for="(row, i) in filtered.slice(0, shown)"
          :key="row.id"
          :anime="row.anime"
          :delay="Math.min(i, 7) * 45"
        />
      </div>
      <div v-if="filtered.length > shown" class="anime-section__more">
        <button type="button" @click="shown += 12">
          <LocalIcon name="down" />{{ t("loadMore") }}
        </button>
      </div></template
    >
    <div v-else class="anime-section__empty" role="status">
      <LocalIcon
        :name="
          items.length
            ? 'material-symbols:search-off-outline-rounded'
            : 'material-symbols:tv-off-outline-rounded'
        "
      /><span>{{ t(items.length ? "animeNoResults" : "animeSyncEmpty") }}</span>
    </div>
  </section>
</template>
<style scoped>
.public-site .anime-section {
  padding: 1.5rem 2rem;
}
.anime-section {
  display: block;
  /* 状态筛选过渡：区块位置的大号 contained LoadingIndicator（out = 淡出退场） */
}
@media (max-width: 639px) {
  .anime-section {
    padding: 1rem 0.75rem;
  }
  .anime-section .anime-list--grid,
  .anime-section .anime-list--list {
    /* Match the original rendered cascade, not its overridden mobile rule. */
    padding-top: 1.25rem;
    gap: 0.875rem;
  }
}
.anime-section__tools {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--outline-variant);
}
.anime-section__search-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
}
.anime-section__search {
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 32rem;
}
.anime-section__search :deep(.m3-text-field) {
  width: 100%;
}
.anime-section__search-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0.25rem;
  border: none;
  background: none;
  color: var(--on-surface-variant);
  cursor: pointer;
  border-radius: var(--shape-corner-full);
}
.anime-section__search-clear > :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}
.anime-section__search-clear:hover {
  background: color-mix(in oklab, var(--on-surface-variant) 8%, transparent);
}
.anime-section__filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
}
.anime-section__chips {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.anime-section__chips::-webkit-scrollbar {
  display: none;
}
.anime-section__count {
  margin: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
  white-space: nowrap;
}
.anime-section__layout-switch {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  padding: 0.125rem;
  border-radius: var(--shape-corner-m);
  background: var(--surface-container-high);
  border: 1px solid var(--outline-variant);
}
.anime-section__layout-btn {
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: none;
  border-radius: var(--shape-corner-s);
  background: transparent;
  color: var(--on-surface-variant);
  cursor: pointer;
  transition:
    background-color var(--m3e-duration-short) var(--m3e-easing-standard),
    color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.anime-section__layout-btn > :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}
.anime-section__layout-btn:hover {
  color: var(--on-surface);
  background: color-mix(in oklab, var(--on-surface) 8%, transparent);
}
.anime-section__layout-btn--active {
  background: var(--primary-container);
  color: var(--on-primary-container);
}
.anime-section__layout-btn--active:hover {
  background: var(--primary-container);
  color: var(--on-primary-container);
}
.anime-section__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 11rem;
  padding-top: 1.5rem;
}
.anime-section__loading--out {
  animation: anime-loading-out var(--m3e-duration-short)
    var(--m3e-easing-emphasized-accelerate) both;
}
.anime-section__more {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}
.anime-section__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.875rem;
  min-height: 12rem;
  padding-top: 1.5rem;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-large);
}
.anime-section__empty > :deep(svg) {
  width: 2.75rem;
  height: 2.75rem;
  color: var(--outline);
}
/* 海报网格（grid）：手机 2 列、平板 3 列、电脑端精准 4 列，紧凑美观 */
.anime-list--grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.875rem;
  padding-top: 1.25rem;
}
@media (min-width: 32rem) {
  .anime-list--grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.875rem;
  }
}
@media (min-width: 768px) {
  .anime-list--grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}
/* 横向列表（list）：单列，超宽视口双列；卡片横排（封面固定宽 + 正文铺开）。
   跨组件边界覆盖卡片内部类，统一走 :global（容器级驱动，规则集中在布局拥有方）。 */
.anime-list--list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding-top: 1.25rem;
}
@media (min-width: 88rem) {
  .anime-list--list {
    grid-template-columns: repeat(2, 1fr);
  }
}
.anime-list--list :deep(.anime-card) {
  flex-direction: row;
}
.anime-list--list :deep(.anime-card__cover) {
  width: 8.5rem;
  flex-shrink: 0;
}
@media (min-width: 48rem) {
  .anime-list--list :deep(.anime-card__cover) {
    width: 11rem;
  }
}
.anime-list--list :deep(.anime-card__body) {
  flex: 1;
  min-width: 0;
  padding: 1.125rem 1.25rem;
  justify-content: space-between;
}
.anime-list--list :deep(.anime-card__desc) {
  -webkit-line-clamp: 3;
}
/* 指示器退场：淡出 + 轻微收拢（reduced-motion 由全局规则压至终态） */
@-moz-keyframes anime-loading-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
@-webkit-keyframes anime-loading-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
@-o-keyframes anime-loading-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
@keyframes anime-loading-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
</style>
