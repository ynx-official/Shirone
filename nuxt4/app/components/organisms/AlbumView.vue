<script setup lang="ts">
const hydrated = ref(false);
onMounted(() => {
  hydrated.value = true;
});
import type { Entity } from "#shared/types/content";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import { decrypt } from "~/utils/decrypt";
const props = defineProps<{ item: Entity }>();
const { t, locale } = useCopy();
const password = ref(""),
  error = ref(false);
const photos = ref<any[]>(props.item.data.photos || []);
let viewer: { destroy: () => void } | undefined;
let generation = 0;
let opening = false;
const visiblePhotos = computed(() => {
  if (props.item.data.layout !== "masonry") return photos.value;
  const priority = (photo: any) =>
    photo.width && photo.height
      ? photo.width < photo.height
        ? 0
        : photo.width === photo.height
          ? 1
          : 2
      : 1;
  return [...photos.value].sort((a, b) => priority(a) - priority(b));
});
function closeViewer() {
  generation++;
  opening = false;
  viewer?.destroy();
  viewer = undefined;
}
onBeforeUnmount(closeViewer);
watch(
  () => props.item,
  (item) => {
    photos.value = item.data.photos || [];
    password.value = "";
    error.value = false;
    closeViewer();
  },
);
async function unlock() {
  try {
    const result = await decrypt<{ photos: any[] }>(
      props.item.data.cipher,
      password.value,
    );
    photos.value = result.photos;
    password.value = "";
    error.value = false;
  } catch {
    error.value = true;
  }
}
async function open(event: MouseEvent, index: number) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (opening) return;
  opening = true;
  const current = generation;
  const trigger = event.currentTarget as HTMLElement;
  try {
    const { openAlbumViewer } = await import("~/utils/album-viewer");
    if (current !== generation) return;
    viewer?.destroy();
    viewer = openAlbumViewer(
      visiblePhotos.value,
      index,
      trigger,
      locale.value,
      {
        CLOSE: t("close"),
        NEXT: t("nextImage"),
        PREV: t("previousImage"),
        ZOOM_IN: t("mermaidZoomIn"),
        ZOOM_OUT: t("mermaidZoomOut"),
        RESET: t("reset"),
      },
    );
  } catch {
    if (current === generation)
      window.location.assign(visiblePhotos.value[index].src);
  } finally {
    if (current === generation) opening = false;
  }
}
</script>
<template>
  <section class="album-detail" :data-album-ready="hydrated || undefined">
    <header class="album-detail__hero">
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.title"
        decoding="async"
        referrerpolicy="no-referrer"
      />
      <NuxtLink class="album-detail__back" to="/albums/">
        <LocalIcon name="arrow-back-rounded" />{{ t("albumsBack") }}
      </NuxtLink>
      <div class="album-detail__hero-content">
        <h1>
          <LocalIcon name="photo-library-outline-rounded" />{{ item.title }}
        </h1>
        <p v-if="item.description">{{ item.description }}</p>
        <div class="album-detail__meta">
          <span v-if="item.date"
            ><LocalIcon name="date" /><time :datetime="item.date">{{
              item.date
            }}</time></span
          >
          <span v-if="item.data.location"
            ><LocalIcon name="location-on-rounded" />{{
              item.data.location
            }}</span
          >
          <span v-if="!item.data.protected || photos.length"
            ><LocalIcon name="photo-library-outline-rounded" />{{
              photos.length
            }}
            {{ t("albumsPhotos") }}</span
          >
        </div>
        <div
          v-if="item.tags?.length"
          class="album-detail__tags"
          :aria-label="t('tags')"
        >
          <span v-for="tag in item.tags" :key="tag">#{{ tag }}</span>
        </div>
      </div>
    </header>
    <div class="album-detail__gallery">
      <form
        v-if="item.data.protected && !photos.length"
        @submit.prevent="unlock"
      >
        <label
          >{{ t("password")
          }}<input
            v-model="password"
            type="password"
            :disabled="!hydrated"
            required /></label
        ><button :disabled="!hydrated">{{ t("unlock") }}</button>
        <p v-if="error" role="alert">{{ t("unlockError") }}</p>
      </form>
      <div
        class="album-gallery"
        :class="
          item.data.layout === 'grid'
            ? 'album-gallery--grid'
            : 'album-gallery--masonry'
        "
        :style="{ '--album-columns': item.data.columns || 3 }"
      >
        <a
          v-for="(photo, i) in visiblePhotos"
          :key="i"
          class="album-gallery__item"
          :href="photo.src"
          :aria-label="`${t('openImage')} ${i + 1}: ${photo.alt || item.title}`"
          @click="open($event, i)"
        >
          <img
            :src="photo.thumbnail || photo.src"
            :alt="photo.alt || ''"
            :width="photo.width || 600"
            :height="photo.height || 400"
            loading="lazy"
          />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.album-detail__hero {
  position: relative;
  overflow: hidden;
  border-radius: var(--shape-corner-l);
  background: var(--surface-container-high);
}
.album-detail__hero > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.9);
}
/* White text and black scrim preserve contrast over arbitrary album photographs. */
.album-detail__hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgb(0 0 0 / 0.78),
    rgb(0 0 0 / 0.38) 42%,
    rgb(0 0 0 / 0.12) 68%,
    transparent 92%
  );
}
.album-detail__hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 22rem;
  padding: 5rem 1.5rem 1.5rem;
  color: white;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.7);
}
.album-detail__hero-content h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font: var(--m3e-type-headline-large);
  font-weight: 700;
  overflow-wrap: anywhere;
}
.album-detail__hero-content h1 svg {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}
.album-detail__hero-content p {
  margin: 0.375rem 0 0.75rem;
  font: var(--m3e-type-body-medium);
}
.album-detail__back {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--shape-corner-s);
  background: rgb(0 0 0 / 0.5);
  color: white;
  font: var(--m3e-type-label-medium);
  text-decoration: none;
  backdrop-filter: blur(0.25rem);
}
.album-detail__back:hover {
  background: rgb(0 0 0 / 0.7);
}
.album-detail__back:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}
.album-detail__back svg {
  width: 1rem;
  height: 1rem;
}
.album-detail__meta,
.album-detail__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  font: var(--m3e-type-body-small);
}
.album-detail__meta {
  margin-top: 0.75rem;
}
.album-detail__meta > span {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}
.album-detail__meta svg {
  width: 1.125rem;
  height: 1.125rem;
}
.album-detail__tags {
  margin-top: 0.75rem;
}
.album-detail__tags > span {
  padding: 0.25rem 0.5rem;
  border-radius: var(--shape-corner-s);
  background: rgb(255 255 255 / 0.16);
}
.album-detail__gallery {
  margin-top: 1rem;
  padding: 1.25rem;
  border-radius: var(--shape-corner-l);
  background: var(--card-bg);
}
@media (max-width: 639px) {
  .album-detail__hero-content {
    min-height: 19rem;
    padding: 5rem 1rem 1rem;
  }
  .album-detail__gallery {
    padding: 0.75rem;
  }
}
.album-gallery {
  --album-gap: var(--m3e-space-3);
  width: 100%;
}
.album-gallery--masonry {
  column-width: 240px;
  column-gap: var(--album-gap);
}
.album-gallery--grid {
  display: grid;
  grid-template-columns: repeat(var(--album-columns), minmax(0, 1fr));
  gap: var(--album-gap);
}
.album-gallery__item {
  display: block;
  width: 100%;
  margin: 0 0 var(--album-gap);
  overflow: hidden;
  border-radius: var(--shape-corner-m);
  background: var(--surface-container-high);
  break-inside: avoid;
  cursor: zoom-in;
}
.album-gallery__item img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform var(--m3e-duration-medium) var(--m3e-easing-standard);
}
.album-gallery__item:hover img {
  transform: scale(1.025);
}
@media (max-width: 767px) {
  .album-gallery--masonry {
    column-width: 180px;
  }
}
@media (max-width: 479px) {
  .album-gallery--masonry {
    column-width: 140px;
  }
  .album-gallery--grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (prefers-reduced-motion: reduce) {
  .album-gallery__item img {
    transition: none;
  }
}
</style>
