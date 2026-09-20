<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import type { CompassEntry } from "#shared/types/discovery";
const props = defineProps<{ entry: CompassEntry; delay: number }>();
const failed = ref(false);
const kind = computed(() =>
  props.entry.image
    ? "image"
    : /^[\w-]+:[\w-]+$/.test(props.entry.icon || "")
      ? "icon"
      : /^(https?:\/\/|\/)/.test(props.entry.icon || "")
        ? "image"
        : "letter",
);
const host = computed(() => {
  try {
    return new URL(props.entry.href).hostname.replace(/^www\./, "");
  } catch {
    return props.entry.href;
  }
});
const href = computed(() =>
  /^(https?:\/\/|\/(?!\/))/.test(props.entry.href)
    ? props.entry.href
    : undefined,
);
watch(
  () => [props.entry.image, props.entry.icon],
  () => {
    failed.value = false;
  },
);
</script>
<template>
  <article class="compass-tile" :style="{ '--discovery-delay': `${delay}ms` }">
    <a
      class="compass-tile__link"
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="compass-tile__icon" aria-hidden="true"
        ><img
          v-if="kind === 'image' && !failed"
          :src="entry.image || entry.icon"
          alt=""
          loading="lazy"
          referrerpolicy="no-referrer"
          @error="failed = true"
        /><LocalIcon v-else-if="kind === 'icon'" :name="entry.icon!" /><span
          v-else
          class="compass-tile__letter"
          >{{ (entry.label.charAt(0) || "?").toUpperCase() }}</span
        ></span
      >
      <span class="compass-tile__label">{{ entry.label }}</span
      ><span class="compass-tile__note">{{ entry.note || host }}</span>
    </a>
  </article>
</template>
<style scoped>
/* 竖向瓷砖：底色与站内卡片一致（card-bg + outline-variant 边框），hover 加深 */
.compass-tile {
  box-sizing: border-box;
  background: var(--card-bg);
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-l);
  padding: var(--m3e-space-3) var(--m3e-space-4);
  --m3e-state-color: var(--on-surface);
  transition:
    border-color var(--m3e-duration-medium)
      var(--m3e-easing-emphasized-decelerate),
    box-shadow var(--m3e-duration-medium)
      var(--m3e-easing-emphasized-decelerate),
    background-color var(--m3e-duration-medium) var(--m3e-easing-standard);
  /* 图标位：44×44 灰块（highest 混 6% on-surface，两种模式下均自成一级），悬停轻微上浮。
	   内边距保证图片形态不贴边（image 撑满内容区，object-fit: contain） */
  /* 首字母兜底：tonal 块内的大号字（on-surface-variant） */
}
.compass-tile:hover {
  border-color: var(--outline);
  box-shadow: var(--m3e-elevation-1);
  background: color-mix(in oklab, var(--on-surface) 3%, var(--card-bg));
}
.compass-tile__link {
  display: flex;
  flex-direction: column;
  gap: var(--m3e-space-2);
  min-width: 0;
  text-decoration: none;
}
.compass-tile__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  padding: 0.375rem;
  box-sizing: border-box;
  border-radius: var(--shape-corner-m);
  background: color-mix(
    in oklab,
    var(--on-surface) 6%,
    var(--surface-container-highest)
  );
  color: var(--primary);
  transition: transform var(--m3e-duration-medium)
    var(--m3e-easing-emphasized-decelerate);
}
.compass-tile__icon > :deep(svg) {
  width: 1.5rem;
  height: 1.5rem;
}
.compass-tile__icon > :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: var(--shape-corner-s);
}
.compass-tile:hover .compass-tile__icon {
  transform: translateY(-0.125rem);
}
.compass-tile__letter {
  color: var(--on-surface-variant);
  font: var(--m3e-type-title-medium);
  font-weight: 600;
  line-height: 1;
}
.compass-tile__label {
  margin: 0;
  color: var(--on-surface);
  font: var(--m3e-type-title-small);
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--m3e-duration-short) var(--m3e-easing-standard);
}
.compass-tile:hover .compass-tile__label {
  color: var(--primary);
}
.compass-tile__note {
  margin: 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
