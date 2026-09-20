<script setup lang="ts">
import { loadingShapes } from "~/assets/moment-loading-shapes";
withDefaults(defineProps<{ size?: number }>(), { size: 32 });
const { morphs, scale } = loadingShapes.indeterminate;
const phase = ref(0),
  progress = ref(0),
  rotation = ref(90);
const path = computed(
  () =>
    morphs[phase.value]!.map(([a, b], i) => {
      const p = a.map((v, j) =>
        ((v + (b[j]! - v) * progress.value - 0.5) * 38 * scale + 24).toFixed(2),
      );
      return `${i === 0 ? `M${p[0]} ${p[1]}` : ""}C${p.slice(2).join(" ")}`;
    }).join("") + "Z",
);
let frame = 0;
let dispose = () => {};
onMounted(() => {
  // Original M3E constants: 650ms per morph, 4666ms rotation, spring 200/0.6.
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let start = performance.now(),
    phaseStart = start,
    previous = start,
    velocity = 0;
  const reduced = () =>
    media.matches ||
    document.documentElement.classList.contains("motion-reduced");
  const tick = (now: number) => {
    if (document.hidden) {
      previous = now;
      frame = requestAnimationFrame(tick);
      return;
    }
    if (now - phaseStart >= 650) {
      phase.value = (phase.value + 1) % morphs.length;
      progress.value = 0;
      velocity = 0;
      phaseStart = now;
    }
    const dt = Math.min(Math.max((now - previous) / 1000, 0.001), 0.05);
    velocity +=
      (-200 * (progress.value - 1) - 2 * 0.6 * Math.sqrt(200) * velocity) * dt;
    progress.value = Math.max(
      -0.05,
      Math.min(1.15, progress.value + velocity * dt),
    );
    rotation.value =
      progress.value * 90 +
      (phase.value + 1) * 90 +
      ((now - start) / 4666) * 360;
    previous = now;
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    if (!reduced()) {
      start = performance.now();
      phaseStart = start;
      previous = start;
      frame = requestAnimationFrame(tick);
    }
  };
  const observer = new MutationObserver(sync);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  media.addEventListener("change", sync);
  sync();
  dispose = () => {
    observer.disconnect();
    media.removeEventListener("change", sync);
    cancelAnimationFrame(frame);
  };
});
onBeforeUnmount(() => dispose());
</script>
<template>
  <span
    class="moment-loading-indicator"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
    ><svg viewBox="0 0 48 48">
      <path
        :d="path"
        :transform="`rotate(${rotation} 24 24)`"
        fill="currentColor"
      /></svg
  ></span>
</template>
<style scoped>
.moment-loading-indicator {
  display: inline-flex;
  flex-shrink: 0;
  border-radius: var(--shape-corner-full);
  background: var(--primary-container);
  color: var(--on-primary-container);
}
.moment-loading-indicator svg {
  width: 100%;
  height: 100%;
}
</style>
