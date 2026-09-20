<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import MomentImageView from "~/components/atoms/MomentImage.vue";
import type { MomentImage } from "#shared/types/moments";
const props = defineProps<{ images: MomentImage[] }>();
const { t, locale } = useCopy();
const index = ref(0),
  viewing = ref(false);
const viewer = ref<HTMLElement>(),
  grid = ref<HTMLElement>(),
  thumbs = ref<HTMLElement>();
let lastIndex = 0,
  generation = 0,
  opening = false;
let lightbox: { destroy: () => void } | undefined;
const current = computed(() => props.images[index.value]!);
const variant = computed(() =>
  props.images.length === 1
    ? "single"
    : props.images.length === 3
      ? "mosaic"
      : props.images.length <= 4
        ? "pair"
        : "trio",
);
const reducedMotion = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  document.documentElement.classList.contains("motion-reduced");
const tileLabel = (i: number) => `${t("openImage")} ${i + 1}`;
function tileSizes(i: number) {
  if (variant.value === "single")
    return "(max-width: 639px) calc(100vw - 6.25rem), 480px";
  if (variant.value === "pair")
    return "(max-width: 639px) calc((100vw - 6.75rem) / 2), 240px";
  if (variant.value === "mosaic")
    return i === 0
      ? "(max-width: 639px) calc((100vw - 6.75rem) * .66), 320px"
      : "(max-width: 639px) calc((100vw - 6.75rem) * .33), 160px";
  return "(max-width: 639px) calc((100vw - 7.25rem) / 3), 200px";
}
async function openInline(event: MouseEvent, i: number) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  if (props.images.length === 1) {
    await openLightbox(event, i);
    return;
  }
  event.preventDefault();
  lastIndex = i;
  index.value = i;
  viewing.value = true;
  await nextTick();
  viewer.value?.focus({ preventScroll: true });
}
async function collapse() {
  viewing.value = false;
  await nextTick();
  (grid.value?.children[lastIndex] as HTMLElement | undefined)?.focus({
    preventScroll: true,
  });
}
function keydown(event: KeyboardEvent) {
  const positions: Record<string, number> = {
    ArrowLeft: index.value - 1,
    ArrowRight: index.value + 1,
    Home: 0,
    End: props.images.length - 1,
  };
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    void collapse();
  } else if (event.key in positions) {
    event.preventDefault();
    index.value = Math.max(
      0,
      Math.min(props.images.length - 1, positions[event.key]!),
    );
  }
}
watch([index, viewing], async () => {
  await nextTick();
  const strip = thumbs.value,
    thumb = strip?.children[index.value] as HTMLElement | undefined;
  if (!strip || !thumb) return;
  strip.scrollTo({
    left:
      thumb.offsetLeft -
      strip.offsetLeft -
      (strip.clientWidth - thumb.clientWidth) / 2,
    behavior: reducedMotion() ? "instant" : "smooth",
  });
});
async function openLightbox(event: MouseEvent, i: number) {
  if (import.meta.server) return;
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (opening) return;
  opening = true;
  const token = generation,
    trigger = event.currentTarget as HTMLElement;
  try {
    const { openAlbumViewer } = await import("~/utils/album-viewer");
    if (generation !== token) return;
    lightbox?.destroy();
    lightbox = openAlbumViewer(props.images, i, trigger, locale.value, {
      CLOSE: t("close"),
      NEXT: t("nextImage"),
      PREV: t("previousImage"),
      ZOOM_IN: t("mermaidZoomIn"),
      ZOOM_OUT: t("mermaidZoomOut"),
      RESET: t("reset"),
    });
  } catch {
    if (generation === token) window.location.assign(props.images[i]!.src);
  } finally {
    if (generation === token) opening = false;
  }
}
onBeforeUnmount(() => {
  generation++;
  lightbox?.destroy();
});
</script>

<template>
  <div
    v-if="viewing"
    ref="viewer"
    class="moment-viewer"
    role="group"
    :aria-label="t('imageViewer')"
    :aria-roledescription="t('imageViewer')"
    tabindex="-1"
    @keydown="keydown"
  >
    <div class="moment-viewer__bar">
      <span class="moment-viewer__counter" aria-live="polite"
        >{{ index + 1 }} / {{ images.length }}</span
      >
      <div class="moment-viewer__actions">
        <a
          :href="current.src"
          class="moment-viewer__control"
          :aria-label="t('viewOriginal')"
          @click="openLightbox($event, index)"
          ><LocalIcon name="material-symbols:open-in-full-rounded"
        /></a>
        <button
          type="button"
          class="moment-viewer__control"
          :aria-label="t('backToGrid')"
          @click="collapse"
        >
          <LocalIcon name="material-symbols:contract-rounded" />
        </button>
      </div>
    </div>
    <div class="moment-viewer__stage">
      <button
        type="button"
        class="moment-viewer__control moment-viewer__control--tonal"
        :aria-label="t('previousImage')"
        :disabled="index === 0"
        @click="index--"
      >
        <LocalIcon name="material-symbols:chevron-left-rounded" />
      </button>
      <a
        :key="current.src"
        :href="current.src"
        class="moment-viewer__stage-btn"
        :aria-label="
          current.alt
            ? `${t('viewOriginal')}: ${current.alt}`
            : t('viewOriginal')
        "
        @click="openLightbox($event, index)"
      >
        <MomentImageView
          :src="current.src"
          :alt="current.alt || ''"
          loading="eager"
        />
      </a>
      <button
        type="button"
        class="moment-viewer__control moment-viewer__control--tonal"
        :aria-label="t('nextImage')"
        :disabled="index === images.length - 1"
        @click="index++"
      >
        <LocalIcon name="material-symbols:chevron-right-rounded" />
      </button>
    </div>
    <p v-if="current.alt" class="moment-viewer__caption">{{ current.alt }}</p>
    <div ref="thumbs" class="moment-viewer__thumbs">
      <button
        v-for="(image, i) in images"
        :key="`${image.src}:${i}`"
        type="button"
        class="moment-viewer__thumb"
        :aria-label="tileLabel(i)"
        :aria-current="i === index ? 'true' : undefined"
        @click="index = i"
      >
        <img
          :src="image.thumbnail || image.src"
          :srcset="image.srcset"
          sizes="56px"
          alt=""
          loading="lazy"
          decoding="async"
        />
      </button>
    </div>
  </div>
  <div
    v-else
    ref="grid"
    class="moment-card__gallery"
    :class="`moment-card__gallery--${variant}`"
  >
    <a
      v-for="(image, i) in images.slice(0, 6)"
      :key="`${image.src}:${i}`"
      :href="image.src"
      class="moment-card__tile"
      :class="{
        'moment-card__tile--single': variant === 'single',
        'moment-card__tile--hero': variant === 'mosaic' && i === 0,
      }"
      :aria-label="tileLabel(i)"
      @click="openInline($event, i)"
    >
      <MomentImageView
        :src="image.thumbnail || image.src"
        :srcset="image.srcset"
        :sizes="tileSizes(i)"
        :alt="image.alt || ''"
        :width="image.width"
        :height="image.height"
        loading="lazy"
        decoding="async"
      />
      <span v-if="images.length > 6 && i === 5" class="moment-card__more"
        >+{{ images.length - 6 }}</span
      >
    </a>
  </div>
</template>

<style scoped>
.moment-card__gallery {
  display: grid;
  gap: 0.5rem;
  margin-top: 0.875rem;
}
.moment-card__gallery--pair {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 30rem;
}
.moment-card__gallery--mosaic {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  max-width: 30rem;
}
.moment-card__gallery--trio {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-width: 38rem;
}
.moment-card__tile {
  position: relative;
  display: flex;
  min-width: 0;
  padding: 0;
  border: none;
  overflow: hidden;
  border-radius: var(--shape-corner-m);
  aspect-ratio: 1;
  background: var(--surface-container-high);
  cursor: zoom-in;
}
.moment-card__tile :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.moment-card__tile--single {
  aspect-ratio: 4/3;
  width: 100%;
  max-width: 30rem;
  border-radius: var(--shape-corner-l);
}
.moment-card__tile--hero {
  grid-row: span 2;
  aspect-ratio: auto;
}
/* Fixed black/white is limited to the original image-overlay readability exception. */
.moment-card__more {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 60%);
  color: white;
  font: var(--m3e-type-title-large);
}
.moment-viewer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.875rem;
  padding: 0.75rem;
  border-radius: var(--shape-corner-l);
  background: var(--surface-container-low);
  border: 1px solid var(--outline-variant);
  outline: none;
  animation: moment-viewer-in var(--m3e-duration-medium)
    var(--m3e-easing-emphasized-decelerate);
}
.moment-viewer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.moment-viewer__counter {
  padding: 0.1875rem 0.625rem;
  border-radius: var(--shape-corner-full);
  background: var(--surface-container-high);
  color: var(--on-surface-variant);
  font: var(--m3e-type-label-medium);
  font-variant-numeric: tabular-nums;
}
.moment-viewer__actions {
  display: inline-flex;
  gap: 0.25rem;
}
.moment-viewer__control {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: var(--shape-corner-full);
  background: transparent;
  color: var(--on-surface-variant);
}
.moment-viewer__control svg {
  width: 1.25rem;
  height: 1.25rem;
}
.moment-viewer__control--tonal {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}
.moment-viewer__control:disabled {
  background: color-mix(in oklab, var(--on-surface) 10%, transparent);
  color: var(--on-surface-variant);
  opacity: 0.38;
}
.moment-viewer__stage {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.moment-viewer__stage-btn {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16/9;
  max-height: 26rem;
  padding: 0;
  border: none;
  background: var(--surface-container-high);
  border-radius: var(--shape-corner-m);
  overflow: hidden;
  cursor: zoom-in;
}
.moment-viewer__stage-btn :deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.moment-viewer__caption {
  margin: 0;
  text-align: center;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-small);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.moment-viewer__thumbs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 2px 2px 0.25rem;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}
.moment-viewer__thumb {
  flex-shrink: 0;
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border: none;
  overflow: hidden;
  border-radius: var(--shape-corner-m);
  background: var(--surface-container-high);
  opacity: 0.7;
  scroll-snap-align: center;
  transition: opacity var(--m3e-duration-short) var(--m3e-easing-standard);
}
.moment-viewer__thumb:hover,
.moment-viewer__thumb[aria-current="true"] {
  opacity: 1;
}
.moment-viewer__thumb[aria-current="true"] {
  box-shadow: 0 0 0 2px var(--primary);
}
.moment-viewer__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.moment-card__tile:focus-visible,
.moment-viewer a:focus-visible,
.moment-viewer button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
@keyframes moment-viewer-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@media (max-width: 639px) {
  .moment-viewer__stage-btn {
    max-height: 18rem;
  }
  .moment-viewer__thumb {
    width: 2.75rem;
    height: 2.75rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .moment-viewer {
    animation: none;
  }
  .moment-viewer * {
    transition: none;
  }
}
:global(.motion-reduced) .moment-viewer {
  animation: none;
}
:global(.motion-reduced) .moment-viewer * {
  transition: none;
}
</style>
