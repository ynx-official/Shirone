<script setup lang="ts">
import type { Post } from "#shared/types/content";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
defineProps<{ post: Post }>();
const { t } = useCopy();
</script>
<template>
  <article class="post-card" :class="{ 'has-cover': post.image }">
    <div class="post-card-body">
      <h2>
        <NuxtLink :to="post.url" class="post-card-title"
          ><span class="title-accent" /><span
            v-if="post.pinned || post.protected"
            class="post-state"
            :title="t(post.protected ? 'postEncryptedBadge' : 'pinned')"
            ><LocalIcon :name="post.pinned ? 'pin' : 'lock'" /><span
              v-if="post.pinned && post.protected"
              class="pin-lock"
              ><LocalIcon name="lock" /></span></span
          ><span>{{ post.title }}</span
          ><LocalIcon name="arrow" class="title-arrow"
        /></NuxtLink>
      </h2>
      <div class="post-meta">
        <span
          ><i class="meta-icon"><LocalIcon name="date" /></i
          ><time :datetime="post.published">{{
            post.published.slice(0, 10)
          }}</time></span
        ><NuxtLink
          :to="{ path: '/archive/', query: { category: post.category } }"
          ><i class="meta-icon"><LocalIcon name="category" /></i
          >{{ post.category || t("uncategorized") }}</NuxtLink
        ><span v-if="!(post.protected && post.hideHomeContent)"
          ><i class="meta-icon"><LocalIcon name="words" /></i
          >{{ post.words || 0 }} {{ t("wordsCount") }}</span
        >
      </div>
      <p class="post-description">
        {{
          post.protected && post.hideHomeContent
            ? t("postEncryptedSummary")
            : post.description
        }}
      </p>
      <div class="post-tags">
        <NuxtLink
          v-for="tag in post.tags"
          :key="tag"
          :to="{ path: '/archive/', query: { tag } }"
          ># {{ tag }}</NuxtLink
        >
      </div>
    </div>
    <NuxtLink
      v-if="post.image"
      :to="post.url"
      class="post-cover"
      :aria-label="post.title"
      ><img
        :src="post.image"
        alt=""
        width="420"
        height="280"
        loading="lazy" /><span class="post-cover-hover"
        ><LocalIcon name="arrow" /></span
    ></NuxtLink>
    <NuxtLink v-else :to="post.url" class="post-enter" :aria-label="post.title"
      ><LocalIcon name="arrow"
    /></NuxtLink>
  </article>
</template>
