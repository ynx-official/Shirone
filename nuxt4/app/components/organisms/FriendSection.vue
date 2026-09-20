<script setup lang="ts">
import type { Entity } from "#shared/types/content";
import FriendCard from "~/components/molecules/FriendCard.vue";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import FriendFilterLoading from "~/components/atoms/FriendFilterLoading.vue";
const props = defineProps<{ friends: Entity[] }>();
const { t } = useCopy();
const route = useRoute(),
  router = useRouter();
const query = ref(String(route.query.q || ""));
const selectedTag = ref(String(route.query.tag || ""));
const searchInput = ref<HTMLInputElement>();
const phase = ref("idle");
let timers: ReturnType<typeof setTimeout>[] = [];
function selectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? "" : tag;
  syncUrl();
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
onBeforeUnmount(() => timers.forEach(clearTimeout));
watch(
  () => [route.query.q, route.query.tag],
  () => {
    query.value = String(route.query.q || "");
    selectedTag.value = String(route.query.tag || "");
  },
);
function syncUrl() {
  void router.replace({
    path: route.path,
    query: {
      ...route.query,
      q: query.value || undefined,
      tag: selectedTag.value || undefined,
    },
    hash: route.hash,
  });
}
function clearSearch() {
  query.value = "";
  syncUrl();
  searchInput.value?.focus();
}
const tags = computed(() =>
  [...new Set(props.friends.flatMap((friend) => friend.tags))].sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  ),
);
const filtered = computed(() =>
  props.friends.filter((friend) => {
    if (selectedTag.value && !friend.tags.includes(selectedTag.value))
      return false;
    const q = query.value.trim().toLowerCase();
    let host = String(friend.data.siteurl || "");
    try {
      host = new URL(host).hostname;
    } catch {
      /* Retain malformed source URLs for search. */
    }
    return (
      !q ||
      [friend.title, friend.description, host, ...friend.tags].some((value) =>
        value.toLowerCase().includes(q),
      )
    );
  }),
);
</script>

<template>
  <section class="panel friend-section">
    <header class="friend-section__heading">
      <div class="friend-section__title-row">
        <LocalIcon name="material-symbols:handshake-outline-rounded" />
        <h1>{{ t("friends") }}</h1>
      </div>
      <p>{{ t("friendsBanner") }}</p>
    </header>
    <form
      v-if="friends.length"
      class="friend-section__tools"
      :action="route.path"
      method="get"
      @submit.prevent="syncUrl"
    >
      <div class="friend-section__search">
        <LocalIcon name="search" />
        <input
          ref="searchInput"
          v-model="query"
          name="q"
          type="search"
          :aria-label="t('search')"
          :placeholder="t('search')"
          @input="syncUrl"
        />
        <button
          v-if="query"
          type="button"
          class="friend-section__search-clear"
          :aria-label="t('clear')"
          @click="clearSearch"
        >
          <LocalIcon name="close" />
        </button>
      </div>
      <input v-if="selectedTag" type="hidden" name="tag" :value="selectedTag" />
      <div v-if="tags.length" class="friend-section__chips">
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
      <p class="friend-section__count" role="status">
        {{ filtered.length }}
        {{ t(filtered.length === 1 ? "friendsCount" : "friendsCounts") }}
      </p>
    </form>
    <div
      v-if="phase !== 'idle'"
      class="friend-section__loading"
      :class="{ 'friend-section__loading--out': phase === 'out' }"
      aria-busy="true"
    >
      <FriendFilterLoading />
    </div>
    <div
      v-else-if="filtered.length"
      :key="`${query}|${selectedTag}`"
      class="friend-section__list"
    >
      <FriendCard
        v-for="friend in filtered"
        :key="friend.id"
        :friend="friend"
      />
    </div>
    <div v-else class="friend-section__empty" role="status">
      <LocalIcon name="material-symbols:search-off-outline-rounded" /><span>{{
        t("friendsNoResults")
      }}</span>
    </div>
  </section>
</template>

<style scoped>
.friend-section__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 11rem;
  padding-top: 1.5rem;
}
.friend-section__loading--out {
  animation: friend-loading-out var(--m3e-duration-short)
    var(--m3e-easing-emphasized-accelerate) both;
}
@keyframes friend-loading-out {
  to {
    opacity: 0;
    transform: scale(0.96);
  }
}
.public-site .friend-section {
  padding: 1.5rem 2rem;
}
.friend-section__heading {
  margin-bottom: 1.5rem;
}
.friend-section__title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.friend-section__title-row > svg {
  width: 2rem;
  height: 2rem;
  color: var(--primary);
  flex-shrink: 0;
}
.friend-section h1 {
  margin: 0;
  font: var(--m3e-type-headline-medium);
  font-weight: 700;
  line-height: 1.2;
}
.friend-section__heading p {
  margin: 0.375rem 0 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-medium);
  line-height: 1.5;
}
.friend-section__tools {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--outline-variant);
}
.friend-section__search {
  position: relative;
  width: 100%;
  max-width: 32rem;
  display: flex;
  align-items: center;
}
.friend-section__search > svg {
  position: absolute;
  left: 0.75rem;
  pointer-events: none;
  color: var(--on-surface-variant);
}
.friend-section__search input {
  height: 3rem;
  padding: 0 2.75rem;
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-l);
  background: var(--surface);
  font: var(--m3e-type-body-large);
}
.friend-section__search input::-webkit-search-cancel-button {
  display: none;
}
.friend-section__search:focus-within input {
  border-color: var(--primary);
}
.friend-section__search-clear {
  position: absolute;
  right: 0.5rem;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0.25rem;
  border-radius: var(--shape-corner-full);
  background: transparent;
  color: var(--on-surface-variant);
}
.friend-section__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.friend-section__chips button {
  height: 2rem;
  padding: 0 1rem;
  border: 1px solid var(--outline);
  border-radius: var(--shape-corner-s);
  background: transparent;
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-large);
}
.friend-section__chips button[aria-pressed="true"] {
  border-color: transparent;
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}
.friend-section__chips svg {
  width: 18px;
  height: 18px;
}
.friend-section__count {
  margin: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
}
.friend-section__list {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
  padding-top: 1.5rem;
  animation: friend-reveal var(--m3e-duration-medium) var(--m3e-easing-standard);
}
.friend-section__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 11rem;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-large);
}
.friend-section__empty svg {
  width: 2.5rem;
  height: 2.5rem;
}
@media (min-width: 768px) {
  .friend-section__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 639px) {
  .public-site .friend-section {
    padding: 1.5rem 2rem;
  }
  .friend-section__list {
    padding-top: 1.25rem;
  }
}
@keyframes friend-reveal {
  from {
    opacity: 0;
    transform: translateY(0.25rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .friend-section__list {
    animation: none;
  }
}
:global(.motion-reduced) .friend-section__list {
  animation: none;
}
</style>
