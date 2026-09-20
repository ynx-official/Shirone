<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import MomentGallery from "~/components/molecules/MomentGallery.vue";
import MarkdownBody from "~/components/content/MarkdownBody.vue";
import type { Entity } from "#shared/types/content";
import type { MomentData, MomentAuthor } from "#shared/types/moments";
const props = defineProps<{
  moment: Entity;
  author: MomentAuthor;
  timeZone: string;
  delay?: number;
}>();
const { t } = useCopy();
const data = computed(() => props.moment.data as MomentData);
const published = computed(() => data.value.published || props.moment.date);
const timeText = computed(() => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: props.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(published.value));
  const part = (key: string) => parts.find((p) => p.type === key)?.value;
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}`;
});
</script>
<template>
  <article
    :id="`moment-${moment.id}`"
    class="moment-card"
    :style="{ '--moment-delay': `${delay || 0}ms` }"
  >
    <header class="moment-card__header">
      <NuxtLink class="moment-card__author" :to="author.url"
        ><img
          :src="author.avatar"
          :srcset="author.avatarSrcset"
          sizes="40px"
          alt=""
          width="40"
          height="40"
        /><span>{{ author.name }}</span></NuxtLink
      >
      <div class="moment-card__badges">
        <span v-if="data.mood" class="moment-card__badge" aria-hidden="true"
          ><LocalIcon :name="data.mood" /></span
        ><span
          v-if="data.pinned"
          class="moment-card__badge moment-card__badge--pinned"
          ><LocalIcon name="pin" />{{ t("pinned") }}</span
        >
      </div>
      <time class="moment-card__time" :datetime="published">{{
        timeText
      }}</time>
    </header>
    <MarkdownBody
      v-if="data.html?.trim()"
      class="moment-card__content"
      :html="data.html"
    />
    <p v-else-if="moment.description" class="moment-card__content">
      {{ moment.description }}
    </p>
    <MomentGallery v-if="data.images?.length" :images="data.images" />
    <footer
      v-if="data.location || moment.tags.length"
      class="moment-card__footer"
    >
      <span v-if="data.location" class="moment-card__location"
        ><LocalIcon name="material-symbols:location-on-outline-rounded" />{{
          data.location
        }}</span
      >
      <div v-if="moment.tags.length" class="moment-card__tags">
        <span v-for="tag in moment.tags" :key="tag">#{{ tag }}</span>
      </div>
    </footer>
  </article>
</template>
<style scoped>
.moment-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  animation: moment-reveal var(--m3e-duration-medium)
    var(--m3e-easing-emphasized-decelerate) var(--moment-delay) both;
  min-width: 0;
  padding: var(--m3e-space-4) var(--m3e-space-5);
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-l);
  background: var(--card-bg);
  color: var(--on-surface);
}
.moment-card__header {
  display: flex;
  align-items: center;
  gap: var(--m3e-space-3);
}
.moment-card__author {
  display: inline-flex;
  align-items: center;
  gap: var(--m3e-space-2);
  min-width: 0;
  color: var(--on-surface);
  text-decoration: none;
  font: var(--m3e-type-title-small);
  font-weight: 600;
}
.moment-card__author img {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--shape-corner-full);
  object-fit: cover;
}
.moment-card__badges {
  display: flex;
  align-items: center;
  gap: var(--m3e-space-1);
  flex-shrink: 0;
}
.moment-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: var(--shape-corner-full);
  background: var(--surface-container-high);
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-small);
}
.moment-card__badge svg,
.moment-card__location svg {
  width: 1rem;
  height: 1rem;
}
.moment-card__badge--pinned {
  background: var(--primary-container);
  color: var(--on-primary-container);
}
.moment-card__time {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
}
.moment-card__content {
  margin-top: var(--m3e-space-3);
  font: var(--m3e-type-body-medium);
  line-height: 1.75;
  color: var(--on-surface);
  overflow-wrap: anywhere;
}
.public-site .moment-card__content :deep(p) {
  margin: 0;
}
.moment-card__author span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@keyframes moment-reveal {
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
  .moment-card {
    animation: none;
  }
}
:global(.motion-reduced) .moment-card {
  animation: none;
}
.moment-card__footer {
  /* The global footer rule belongs to the site footer, not a card's metadata. */
  margin: var(--m3e-space-3) 0 0;
  padding: 0;
  border: 0;
  max-width: none;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--m3e-space-3);
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-small);
}
.moment-card__location {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}
.moment-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
@media (max-width: 639px) {
  .moment-card {
    padding: 0.875rem 1rem;
  }
}
</style>
