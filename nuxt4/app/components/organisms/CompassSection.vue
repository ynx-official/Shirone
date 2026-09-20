<script setup lang="ts">
import CompassTile from "~/components/molecules/CompassTile.vue";
import DiscoveryHeading from "~/components/molecules/DiscoveryHeading.vue";
import DiscoverySearch from "~/components/molecules/DiscoverySearch.vue";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import FilterLoading from "~/components/atoms/FriendFilterLoading.vue";
import type { Entity } from "#shared/types/content";
import type { CompassShelf } from "#shared/types/discovery";
import "~/assets/styles/discovery.css";
const props = defineProps<{ items: Entity[] }>();
const { t } = useCopy();
const route = useRoute();
const { query, selected, phase, hydrated, sync, select } =
  useDiscoveryFilter("group");
const shelves = computed(() =>
  props.items.map((item) => item.data as CompassShelf),
);
const host = (href: string) => {
  try {
    return new URL(href).hostname;
  } catch {
    return href;
  }
};
const filtered = computed(() =>
  shelves.value
    .filter((shelf) => !selected.value || shelf.key === selected.value)
    .map((shelf) => ({
      ...shelf,
      entries: shelf.entries.filter(
        (entry) =>
          !query.value.trim() ||
          [entry.label, entry.note || "", host(entry.href)]
            .join(" ")
            .toLowerCase()
            .includes(query.value.trim().toLowerCase()),
      ),
    }))
    .filter((shelf) => shelf.entries.length),
);
const total = computed(() =>
  filtered.value.reduce((n, shelf) => n + shelf.entries.length, 0),
);
</script>
<template>
  <section
    class="panel compass-section"
    :data-compass-ready="hydrated || undefined"
  >
    <DiscoveryHeading
      :title="t('compass')"
      :subtitle="t('compassBanner')"
      icon="material-symbols:explore-rounded"
    />
    <form
      v-if="items.length"
      class="compass-section__tools"
      :action="route.path"
      method="get"
      @submit.prevent="sync"
    >
      <DiscoverySearch
        v-model="query"
        class="compass-section__search"
        @change="sync"
      /><input v-if="selected" type="hidden" name="group" :value="selected" />
      <div
        v-if="shelves.length > 1"
        class="compass-section__chips discovery-chips"
      >
        <button
          v-for="shelf in shelves"
          :key="shelf.key"
          type="button"
          :aria-pressed="selected === shelf.key"
          @click="select(shelf.key)"
        >
          <LocalIcon
            v-if="selected === shelf.key || shelf.icon"
            :name="
              selected === shelf.key
                ? 'material-symbols:check-rounded'
                : shelf.icon!
            "
          />{{ shelf.name }}
        </button>
      </div>
      <p v-if="total > 1" class="compass-section__count" role="status">
        {{ total }} {{ t("compassCounts") }}
      </p>
    </form>
    <div
      v-if="phase !== 'idle'"
      class="compass-section__loading"
      :class="{ 'compass-section__loading--out': phase === 'out' }"
      aria-busy="true"
    >
      <FilterLoading />
    </div>
    <div v-else-if="filtered.length" :key="`${query}|${selected}`">
      <section
        v-for="shelf in filtered"
        :key="shelf.key"
        class="compass-shelf"
        :data-shelf="shelf.key"
      >
        <header class="compass-shelf__heading">
          <div>
            <LocalIcon v-if="shelf.icon" :name="shelf.icon" />
            <h2>{{ shelf.name }}</h2>
          </div>
          <p v-if="shelf.blurb">{{ shelf.blurb }}</p>
        </header>
        <div class="compass-shelf__grid">
          <CompassTile
            v-for="(entry, i) in shelf.entries"
            :key="entry.href"
            :entry="entry"
            :delay="Math.min(i, 7) * 45"
          />
        </div>
      </section>
    </div>
    <div v-else class="compass-section__empty" role="status">
      <LocalIcon name="material-symbols:search-off-outline-rounded" /><span>{{
        t("compassNoResults")
      }}</span>
    </div>
  </section>
</template>
<style scoped>
.public-site .compass-section {
  padding: 1.5rem 2rem;
}
/* 卡片容器（Card 原子根）移动端收窄内边距（同 anime/moment 风格） */
.compass-section {
  display: block;
  /* 分组筛选过渡：区块位置的大号 contained LoadingIndicator（out = 淡出退场） */
}
@media (max-width: 639px) {
  .compass-section {
    padding: 1rem 0.75rem;
  }
}
.compass-section__tools {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--outline-variant);
}
.compass-section__search {
  position: relative;
  width: 100%;
  max-width: 32rem;
}
.compass-section__search :deep(.m3-text-field) {
  width: 100%;
}
.compass-section__search-clear {
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
.compass-section__search-clear > :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
}
.compass-section__search-clear:hover {
  background: color-mix(in oklab, var(--on-surface-variant) 8%, transparent);
}
.compass-section__chips {
  width: 100%;
}
.compass-section__count {
  margin: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
}
.compass-section__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 11rem;
  padding-top: 1.5rem;
}
.compass-section__loading--out {
  animation: compass-loading-out var(--m3e-duration-short)
    var(--m3e-easing-emphasized-accelerate) both;
}
.compass-section__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 11rem;
  padding-top: 1.5rem;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-large);
}
.compass-section__empty > :deep(svg) {
  width: 2.5rem;
  height: 2.5rem;
}
/* 分组：间距 + 站内 SectionTitle 标题行（自带 margin-bottom） */
.compass-shelf {
  margin-top: 1.75rem;
}
.compass-shelf__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: 0.75rem;
}
@media (max-width: 639px) {
  .compass-shelf__grid {
    gap: 0.625rem;
  }
}
/* 指示器退场：淡出 + 轻微收拢（reduced-motion 由全局规则压至终态） */
@-moz-keyframes compass-loading-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
@-webkit-keyframes compass-loading-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
@-o-keyframes compass-loading-out {
  from {
    opacity: 1;
    transform: none;
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
@keyframes compass-loading-out {
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
