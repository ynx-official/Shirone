<script setup lang="ts">
import shape from "~/assets/friend-loading.json";
// The filter lasts 450ms: only the first 650ms morph of the original
// LoadingIndicator is needed. Keep its 200 stiffness / 0.6 damping spring.
const progress = ref(0),
  rotation = ref(90);
const path = computed(
  () =>
    shape.morph
      .map(([a, b], index) => {
        const points = a!.map((v, i) =>
          (
            (v + (b![i]! - v) * progress.value - 0.5) * 38 * shape.scale +
            24
          ).toFixed(2),
        );
        return `${index === 0 ? `M${points[0]} ${points[1]}` : ""}C${points.slice(2).join(" ")}`;
      })
      .join("") + "Z",
);
let frame = 0;
onMounted(() => {
  const start = performance.now();
  let previous = start,
    velocity = 0;
  const tick = (now: number) => {
    const dt = Math.min(Math.max((now - previous) / 1000, 0.001), 0.05);
    velocity +=
      (-200 * (progress.value - 1) - 2 * 0.6 * Math.sqrt(200) * velocity) * dt;
    progress.value = Math.max(
      -0.05,
      Math.min(1.15, progress.value + velocity * dt),
    );
    rotation.value = progress.value * 90 + 90 + ((now - start) / 4666) * 360;
    previous = now;
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
});
onBeforeUnmount(() => cancelAnimationFrame(frame));
</script>
<template>
  <span class="friend-filter-loading" aria-hidden="true"
    ><svg viewBox="0 0 48 48">
      <path
        :d="path"
        :transform="`rotate(${rotation} 24 24)`"
        fill="currentColor"
      /></svg
  ></span>
</template>
<style scoped>
.friend-filter-loading {
  display: inline-flex;
  width: 64px;
  height: 64px;
  background: var(--primary-container);
  color: var(--on-primary-container);
  border-radius: var(--shape-corner-full);
}
.friend-filter-loading svg {
  width: 100%;
  height: 100%;
}
</style>
