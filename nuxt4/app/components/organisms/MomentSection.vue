<script setup lang="ts">
import type { Entity, Site } from "#shared/types/content";
import MomentCard from "~/components/molecules/MomentCard.vue";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import FilterLoading from "~/components/atoms/FriendFilterLoading.vue";
const props = defineProps<{ moments: Entity[] }>();
const { t } = useCopy();
const route = useRoute(),
  router = useRouter();
const query = ref(String(route.query.q || ""));
const selectedTag = ref(String(route.query.tag || ""));
const site = useNuxtData<Site>("site");
const hydrated = ref(false);
onMounted(() => {
  hydrated.value = true;
});
const searchInput = ref<HTMLInputElement>();
const shownCount = ref(10);
const phase = ref("idle");
let timers: ReturnType<typeof setTimeout>[] = [];
onBeforeUnmount(() => timers.forEach(clearTimeout));
function clearSearch() {
  query.value = "";
  sync();
  searchInput.value?.focus();
}
function selectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? "" : tag;
  sync();
  timers.forEach(clearTimeout);
  if (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("motion-reduced")
  ) {
    phase.value = "idle";
    return;
  }
  phase.value = "loading";
  timers = [
    setTimeout(() => (phase.value = "out"), 300),
    setTimeout(() => (phase.value = "idle"), 450),
  ];
}
watch([query, selectedTag], () => {
  shownCount.value = 10;
});
watch(
  () => [route.query.q, route.query.tag],
  () => {
    query.value = String(route.query.q || "");
    selectedTag.value = String(route.query.tag || "");
  },
);
function sync() {
  void router.replace({
    path: route.path,
    hash: route.hash,
    query: {
      ...route.query,
      q: query.value || undefined,
      tag: selectedTag.value || undefined,
    },
  });
}
const tags = computed(() =>
  [...new Set(props.moments.flatMap((m) => m.tags))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  ),
);
const sorted = computed(() =>
  [...props.moments].sort(
    (a, b) =>
      Number(Boolean(b.data.pinned)) - Number(Boolean(a.data.pinned)) ||
      Date.parse(b.data.published || b.date) -
        Date.parse(a.data.published || a.date) ||
      a.id.localeCompare(b.id, "en"),
  ),
);
const searchTexts = computed(
  () =>
    new Map(
      props.moments.map((m) => [
        m.id,
        [
          String(m.data.html || m.description).replace(/<[^>]+>/g, " "),
          m.data.location || "",
          ...m.tags,
        ]
          .join(" ")
          .toLowerCase(),
      ]),
    ),
);
const filtered = computed(() =>
  sorted.value.filter((m) => {
    const q = query.value.trim().toLowerCase();
    return (
      (!selectedTag.value || m.tags.includes(selectedTag.value)) &&
      (!q || searchTexts.value.get(m.id)?.includes(q))
    );
  }),
);
const author = computed(() => ({
  name: site.data.value?.profileName || "",
  avatar: site.data.value?.avatar || "/logo/icon.webp",
  avatarSrcset: site.data.value?.avatarSrcset,
  url: "/about/",
}));
</script>
<template>
  <section
    class="panel moments-section"
    :data-moments-ready="hydrated || undefined"
  >
    <header class="moments-heading">
      <div>
        <LocalIcon name="material-symbols:auto-awesome-outline-rounded" />
        <h1>{{ t("moments") }}</h1>
      </div>
      <p>{{ t("momentsBanner") }}</p>
    </header>
    <form
      v-if="moments.length"
      class="moments-tools"
      :action="route.path"
      method="get"
      @submit.prevent="sync"
    >
      <div class="moments-search">
        <LocalIcon name="search" /><input
          ref="searchInput"
          v-model="query"
          type="search"
          name="q"
          :placeholder="t('search')"
          :aria-label="t('search')"
          @input="sync"
        /><button
          v-if="query"
          type="button"
          :aria-label="t('clear')"
          @click="clearSearch"
        >
          <LocalIcon name="close" />
        </button>
      </div>
      <input v-if="selectedTag" type="hidden" name="tag" :value="selectedTag" />
      <div class="moments-chips">
        <button
          v-for="tag in tags"
          :key="tag"
          type="button"
          :aria-pressed="selectedTag === tag"
          @click="selectTag(tag)"
        >
          <LocalIcon
            v-if="selectedTag === tag"
            name="material-symbols:check-rounded"
          />{{ tag }}
        </button>
      </div>
      <p v-if="filtered.length > 1" class="moments-count" role="status">
        {{ filtered.length }}
        {{ t(filtered.length === 1 ? "momentsCount" : "momentsCounts") }}
      </p>
    </form>
    <div
      v-if="phase !== 'idle'"
      class="moments-loading"
      :class="{ 'moments-loading--out': phase === 'out' }"
      aria-busy="true"
    >
      <FilterLoading />
    </div>
    <div
      v-else-if="filtered.length"
      :key="`${query}|${selectedTag}`"
      class="moments-list"
    >
      <MomentCard
        v-for="(moment, index) in filtered.slice(0, shownCount)"
        :key="moment.id"
        :moment="moment"
        :author="author"
        :time-zone="site.data.value?.timeZone || 'Asia/Shanghai'"
        :delay="Math.min(index, 7) * 45"
      />
    </div>
    <div v-else class="moments-empty" role="status">
      <LocalIcon name="material-symbols:search-off-outline-rounded" />{{
        t("momentsNoResults")
      }}
    </div>
    <div
      v-if="phase === 'idle' && filtered.length > shownCount"
      class="moments-more"
    >
      <button type="button" @click="shownCount += 10">
        <LocalIcon name="down" />{{ t("loadMore") }}
      </button>
    </div>
  </section>
</template>
<style scoped>
.public-site .moments-section {
  padding: 1.5rem 2rem;
}
.moments-heading {
  margin-bottom: 1.5rem;
}
.moments-heading > div {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.moments-heading svg {
  width: 2rem;
  height: 2rem;
  color: var(--primary);
}
.moments-heading h1 {
  margin: 0;
  font: var(--m3e-type-headline-medium);
  font-weight: 700;
  line-height: 1.2;
}
.moments-heading p {
  margin: 0.375rem 0 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-medium);
  line-height: 1.5;
}
.moments-tools {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--outline-variant);
}
.moments-search {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  max-width: 32rem;
}
.moments-search > svg {
  position: absolute;
  left: 0.75rem;
  color: var(--on-surface-variant);
}
.moments-search input {
  height: 3rem;
  padding: 0 2.75rem;
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-l);
  background: var(--surface);
  font: var(--m3e-type-body-large);
}
.moments-search input::-webkit-search-cancel-button {
  display: none;
}
.moments-search button {
  position: absolute;
  right: 0.5rem;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0.25rem;
  border: 0;
  border-radius: var(--shape-corner-full);
  background: transparent;
  color: var(--on-surface-variant);
}
.moments-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.moments-chips button {
  font: var(--m3e-type-label-large);
  height: 2rem;
  padding: 0 1rem;
  border: 1px solid var(--outline);
  border-radius: var(--shape-corner-s);
  background: transparent;
  color: var(--on-surface-variant);
}
.moments-chips button[aria-pressed="true"] {
  border-color: transparent;
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}
.moments-count {
  margin: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
}
.moments-list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  padding-top: 1.5rem;
}
.moments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 11rem;
  padding-top: 1.5rem;
  font: var(--m3e-type-body-large);
  color: var(--on-surface-variant);
}
.moments-empty svg {
  width: 2.5rem;
  height: 2.5rem;
}
@media (max-width: 639px) {
  .public-site .moments-section {
    /* Match the original rendered px-8/py-6 utilities, including mobile. */
    padding: 1.5rem 2rem;
  }
  .moments-list {
    padding-top: 1.25rem;
  }
}
.moments-chips svg {
  width: 18px;
  height: 18px;
}
.moments-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 11rem;
  padding-top: 1.5rem;
}
.moments-loading--out {
  animation: moment-loading-out var(--m3e-duration-short)
    var(--m3e-easing-emphasized-accelerate) both;
}
.moments-more {
  display: flex;
  justify-content: center;
  margin-top: 1.25rem;
}
.moments-more button {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--outline);
}
@keyframes moment-loading-out {
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
@media (prefers-reduced-motion: reduce) {
  .moments-loading--out {
    animation: none;
  }
}
:global(.motion-reduced) .moments-loading--out {
  animation: none;
}
</style>
