<script setup lang="ts">
import type { Entity } from "#shared/types/content";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
const props = defineProps<{ friend: Entity }>();
const failed = ref(false);
const host = computed(() => {
  try {
    return new URL(props.friend.data.siteurl).hostname.replace(/^www\./, "");
  } catch {
    return String(props.friend.data.siteurl || "");
  }
});
</script>

<template>
  <a
    class="friend-card"
    :href="friend.data.siteurl"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="friend.title"
  >
    <div class="friend-card__body">
      <div class="friend-card__header">
        <img
          v-if="friend.image && !failed"
          class="friend-card__avatar"
          :src="friend.image"
          :alt="friend.title"
          width="40"
          height="40"
          loading="lazy"
          @error="failed = true"
        />
        <span
          v-else
          class="friend-card__avatar friend-card__fallback"
          aria-hidden="true"
          >{{ friend.title.slice(0, 1) }}</span
        >
        <div class="friend-card__info">
          <span class="friend-card__title">{{ friend.title }}</span>
          <div class="friend-card__host">{{ host }}</div>
        </div>
        <LocalIcon class="friend-card__arrow" name="arrow" />
      </div>
      <p v-if="friend.description" class="friend-card__desc">
        {{ friend.description }}
      </p>
      <div v-if="friend.tags.length" class="friend-card__tags">
        <span v-for="tag in friend.tags" :key="tag">#{{ tag }}</span>
      </div>
    </div>
  </a>
</template>

<style scoped>
.friend-card {
  display: flex;
  min-width: 0;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-l);
  background: var(--card-bg);
  color: var(--on-surface);
  text-decoration: none;
  transition:
    border-color var(--m3e-duration-medium),
    box-shadow var(--m3e-duration-medium),
    background-color var(--m3e-duration-medium);
}
.friend-card:hover {
  border-color: var(--outline);
  box-shadow: var(--m3e-elevation-1);
  background: color-mix(in oklab, var(--on-surface) 3%, var(--card-bg));
}
.friend-card__body {
  flex: 1;
  min-width: 0;
  padding: var(--m3e-space-4) var(--m3e-space-5);
}
.friend-card__header {
  display: flex;
  align-items: center;
  gap: var(--m3e-space-3);
  margin-bottom: var(--m3e-space-3);
}
.friend-card__avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--shape-corner-full);
  object-fit: cover;
}
.friend-card__fallback {
  display: grid;
  place-items: center;
  color: var(--on-primary-container);
  background: var(--primary-container);
}
.friend-card__info {
  flex: 1;
  min-width: 0;
}
.friend-card__title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--m3e-type-title-small);
  font-weight: 600;
  line-height: 1.3;
}
.friend-card__host {
  margin-top: 0.125rem;
  font: var(--m3e-type-body-small);
  color: var(--on-surface-variant);
  overflow-wrap: anywhere;
}
.friend-card__arrow {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--on-surface-variant);
  transition: transform var(--m3e-duration-medium)
    var(--m3e-easing-emphasized-decelerate);
}
.friend-card:hover .friend-card__title,
.friend-card:hover .friend-card__arrow {
  color: var(--primary);
}
.friend-card:hover .friend-card__arrow {
  transform: translateX(0.25rem);
}
.friend-card__desc {
  margin: 0 0 var(--m3e-space-2);
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.friend-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--m3e-space-1);
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-small);
}
@media (prefers-reduced-motion: reduce) {
  .friend-card,
  .friend-card__arrow {
    transition: none;
  }
}
:global(.motion-reduced) .friend-card,
:global(.motion-reduced) .friend-card__arrow {
  transition: none;
}
</style>
