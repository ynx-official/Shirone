<script setup lang="ts">
import MomentLoadingIndicator from "~/components/atoms/MomentLoadingIndicator.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    src: string;
    alt?: string;
    srcset?: string;
    sizes?: string;
    width?: number;
    height?: number;
    loading?: "lazy" | "eager";
    spinnerSize?: number;
  }>(),
  {
    alt: "",
    loading: "lazy",
    spinnerSize: 28,
    srcset: undefined,
    sizes: undefined,
    width: undefined,
    height: undefined,
  },
);
const image = ref<HTMLImageElement>();
const complete = ref(false),
  visible = ref(false);
let observer: IntersectionObserver | undefined;
onMounted(() => {
  const element = image.value;
  if (!element) return;
  complete.value = element.complete;
  if (!complete.value) {
    observer = new IntersectionObserver((entries) => {
      visible.value = entries.some((e) => e.isIntersecting);
    });
    observer.observe(element);
  }
});
watch(
  () => props.src,
  () => {
    complete.value = false;
  },
);
onBeforeUnmount(() => observer?.disconnect());
function done() {
  complete.value = true;
  observer?.disconnect();
}
</script>
<template>
  <img
    ref="image"
    v-bind="$attrs"
    :src="src"
    :srcset="srcset"
    :sizes="sizes"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    decoding="async"
    :class="{ 'moment-image--loading': visible && !complete }"
    @load="done"
    @error="done"
  />
  <span
    v-if="visible && !complete"
    class="moment-image-loading"
    aria-hidden="true"
    ><MomentLoadingIndicator :size="spinnerSize"
  /></span>
</template>
<style scoped>
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: inherit;
  transition: opacity var(--m3e-duration-short) var(--m3e-easing-standard);
}
.moment-image--loading {
  opacity: 0;
}
.moment-image-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  img {
    transition: none;
  }
}
:global(.motion-reduced) img {
  transition: none;
}
</style>
