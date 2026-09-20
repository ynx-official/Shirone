<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import type { AnimeData } from "#shared/types/discovery";
import { animeStatus } from "~/utils/anime-status";
const props = defineProps<{ anime: AnimeData; delay: number }>();
const { t } = useCopy();
const failed = ref(false);
const meta = computed(() => animeStatus[props.anime.status]);
const ratio = computed(() =>
  props.anime.progress?.total
    ? Math.max(
        0,
        Math.min(1, props.anime.progress.watched / props.anime.progress.total),
      )
    : 0,
);
const href = computed(() =>
  /^(https?:\/\/|\/(?!\/))/.test(props.anime.link || "")
    ? props.anime.link
    : undefined,
);
watch(
  () => props.anime.cover,
  () => {
    failed.value = false;
  },
);
</script>
<template>
  <article
    class="anime-card"
    :data-status="anime.status"
    :style="{
      '--anime-status-color': meta.color,
      '--discovery-delay': `${delay}ms`,
    }"
  >
    <component
      :is="href ? 'a' : 'div'"
      class="anime-card__cover"
      :href="href"
      :target="href ? '_blank' : undefined"
      :rel="href ? 'noopener noreferrer' : undefined"
      :aria-label="href ? anime.title : undefined"
    >
      <img
        v-if="anime.cover && !failed"
        class="anime-card__cover-img"
        :src="anime.cover"
        :alt="anime.title"
        loading="lazy"
        referrerpolicy="no-referrer"
        @error="failed = true"
      />
      <span v-else class="anime-card__placeholder" aria-hidden="true"
        ><LocalIcon name="material-symbols:live-tv-outline-rounded"
      /></span>
      <span class="anime-card__scrim" aria-hidden="true" /><span
        v-if="href"
        class="anime-card__play"
        aria-hidden="true"
        ><LocalIcon name="material-symbols:play-arrow-rounded"
      /></span>
      <span class="anime-card__rating"
        ><LocalIcon name="material-symbols:star-rounded" /><span>{{
          anime.rating
        }}</span></span
      >
    </component>
    <div class="anime-card__body">
      <div class="anime-card__header-row">
        <span class="anime-card__status"
          ><span class="anime-card__status-dot" aria-hidden="true" />{{
            t(meta.key)
          }}</span
        >
      </div>
      <span class="anime-card__title" :title="anime.title">{{
        anime.title
      }}</span>
      <div
        v-if="anime.status === 'watching' && anime.progress"
        class="anime-card__progress"
      >
        <span
          class="anime-card__progress-track"
          role="progressbar"
          :aria-label="`${anime.title} ${anime.progress.watched}/${anime.progress.total}`"
          :aria-valuenow="Math.round(ratio * 100)"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :style="{ '--progress': `${ratio * 100}%` }"
          ><span /><i aria-hidden="true"
        /></span>
        <span class="anime-card__progress-text"
          >{{ anime.progress.watched }}/{{ anime.progress.total }}</span
        >
      </div>
      <p v-if="anime.description" class="anime-card__desc">
        {{ anime.description }}
      </p>
      <p class="anime-card__meta">
        {{ [anime.year, anime.studio].filter(Boolean).join(" · ") }}
      </p>
      <div v-if="anime.genres.length" class="anime-card__genres">
        <span
          v-for="genre in anime.genres"
          :key="genre"
          class="anime-card__genre"
          >#{{ genre }}</span
        >
      </div>
    </div>
  </article>
</template>
<style scoped>
.anime-card {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: var(--shape-corner-l);
  background: var(--card-bg);
  border: 1px solid var(--outline-variant);
  transition:
    border-color var(--m3e-duration-medium)
      var(--m3e-easing-emphasized-decelerate),
    box-shadow var(--m3e-duration-medium)
      var(--m3e-easing-emphasized-decelerate),
    transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate);
  /* 2:3 海报封面：渐变占位同时充当图片加载背景 */
  /* 封面顶部/底部渐变暗影（确保评分徽标可读性） */
  /* 悬停播放层：深色 scrim + 圆形播放钮（仅 link 卡片），hover 淡入放大 */
  /* 占位水印：主题色淡渐变 + tv 图标（无封面时） */
  /* 评分 scrim pill：毛玻璃 + star 图标 + 数字 */
  /* 状态 tonal pill：语义色来自 inline --anime-status-color */
  /* 年份 · 制作：沉底，让无进度/无感想的卡片对齐 */
}
.anime-card:hover {
  border-color: var(--outline);
  box-shadow: var(--m3e-elevation-2);
  transform: translateY(-2px);
}
.anime-card__cover {
  position: relative;
  display: block;
  aspect-ratio: 2/3;
  overflow: hidden;
  background: linear-gradient(
    160deg,
    color-mix(in oklab, var(--primary) 16%, var(--surface-container-low)),
    var(--surface-container-high)
  );
  text-decoration: none;
}
.anime-card__cover-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--m3e-duration-long)
    var(--m3e-easing-emphasized-decelerate);
}
.anime-card:hover .anime-card__cover-img {
  transform: scale(1.05);
}
.anime-card__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.45) 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.25) 100%
  );
  opacity: 0.6;
  transition: opacity var(--m3e-duration-medium) var(--m3e-easing-standard);
}
.anime-card:hover .anime-card__scrim {
  opacity: 0.8;
}
.anime-card__play {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, #000 40%, transparent);
  opacity: 0;
  transition:
    opacity var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate),
    transform var(--m3e-duration-medium) var(--m3e-easing-emphasized-decelerate);
  transform: scale(0.9);
}
.anime-card__play > :deep(svg) {
  width: 2.75rem;
  height: 2.75rem;
  color: #fff;
  filter: drop-shadow(0 0.125rem 0.375rem rgba(0, 0, 0, 0.5));
}
.anime-card:hover .anime-card__play {
  opacity: 1;
  transform: scale(1);
}
.anime-card__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: color-mix(in oklab, var(--on-surface-variant) 40%, transparent);
}
.anime-card__placeholder > :deep(svg) {
  width: 2.5rem;
  height: 2.5rem;
}
.anime-card__rating {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.1875rem;
  padding: 0.1875rem 0.5rem;
  border-radius: var(--shape-corner-full);
  background: color-mix(in srgb, #000 60%, transparent);
  backdrop-filter: blur(0.375rem);
  -webkit-backdrop-filter: blur(0.375rem);
  color: #fff;
  font: var(--m3e-type-label-small);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.anime-card__rating > :deep(svg) {
  width: 0.875rem;
  height: 0.875rem;
  color: #facc15;
}
.anime-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: var(--m3e-space-1);
  padding: var(--m3e-space-3) var(--m3e-space-4) var(--m3e-space-4);
}
.anime-card__header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.anime-card__status {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.3125rem;
  padding: 0.125rem 0.5rem;
  border-radius: var(--shape-corner-full);
  background: color-mix(in oklab, var(--anime-status-color) 12%, transparent);
  color: var(--anime-status-color);
  font: var(--m3e-type-label-small);
  font-weight: 600;
}
.anime-card__status-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: var(--shape-corner-full);
  background: currentColor;
}
.anime-card__title {
  margin: 0;
  color: var(--on-surface);
  font: var(--m3e-type-title-small);
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.anime-card:hover .anime-card__title {
  color: var(--primary);
}
.anime-card__desc {
  margin: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.anime-card__progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.125rem 0;
}
.anime-card__progress-track {
  flex: 1;
  min-width: 0;
}
.anime-card__progress-text {
  flex-shrink: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-small);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.anime-card__meta {
  margin: auto 0 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.anime-card__genres {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.375rem;
}
.anime-card__genre {
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-small);
  transition: color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.anime-card__genre:hover {
  color: var(--primary);
}
:deep(html.motion-reduced) .anime-card,
:deep(html.motion-reduced) .anime-card__cover-img,
:deep(html.motion-reduced) .anime-card__play {
  transition: none;
  transform: none;
}
@media (prefers-reduced-motion: reduce) {
  .anime-card,
  .anime-card__cover-img,
  .anime-card__play {
    transition: none;
    transform: none;
  }
}
</style>
