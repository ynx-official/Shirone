<script setup lang="ts">
import type { Post } from "#shared/types/content";
const props = defineProps<{ posts: Post[] }>();
const { t } = useCopy();
const route = useRoute();
const mode = ref<"year" | "category" | "tag">("year");
const groups = computed(() => {
  const groups = new Map<string, Post[]>();
  for (const post of [...props.posts].sort((a, b) =>
    b.published.localeCompare(a.published),
  )) {
    const keys =
      mode.value === "year"
        ? [post.published.slice(0, 4)]
        : mode.value === "category"
          ? [post.category || t("uncategorized")]
          : post.tags;
    for (const key of keys) groups.set(key, [...(groups.get(key) || []), post]);
  }
  return [...groups];
});
</script>
<template>
  <section class="panel archive-panel">
    <div class="archive-modes">
      <button
        v-for="item in ['year', 'category', 'tag'] as const"
        :key="item"
        :aria-pressed="mode === item"
        @click="mode = item"
      >
        {{ t("archiveGroup" + item[0]!.toUpperCase() + item.slice(1)) }}
      </button>
    </div>
    <details
      v-for="([group, entries], i) in groups"
      :key="mode + group + route.fullPath"
      class="archive-group"
      :open="i === 0 || Object.keys(route.query).length > 0"
    >
      <summary>
        <span>{{ group }}</span
        ><small>{{ entries.length }} {{ t("postCount") }}⌄</small>
      </summary>
      <div v-for="post in entries" :key="post.id" class="archive-row">
        <time :datetime="post.published">{{ post.published.slice(5, 10) }}</time
        ><span class="archive-dot" /><NuxtLink
          class="archive-category"
          :to="{ path: '/archive/', query: { category: post.category } }"
          >{{ post.category || t("uncategorized") }}</NuxtLink
        ><NuxtLink class="archive-title" :to="post.url">{{
          post.title
        }}</NuxtLink
        ><span class="archive-tags">{{
          post.tags.map((tag) => "#" + tag).join("　")
        }}</span>
      </div>
    </details>
  </section>
</template>
