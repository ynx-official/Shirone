<script setup lang="ts">
import type { Site } from "#shared/types/content";
defineProps<{ site: Site; overBanner: boolean }>();
const visible = ref(false);
const nuxt = useNuxtApp();
// Observe actual page readiness, including lazy chunks and async page data.
// Keep this state in the persistent layout, never in a server module singleton.
if (import.meta.client) {
  let started = 0;
  let finishTimer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => {
    clearTimeout(finishTimer);
    visible.value = false;
  };
  const hide = () => {
    if (!visible.value) return;
    // Cached/local routes may resolve within one frame. Keep feedback visible
    // for one medium motion interval, without delaying navigation or content.
    const token = getComputedStyle(document.documentElement)
      .getPropertyValue("--m3e-duration-medium")
      .trim();
    const minimum =
      parseFloat(token) * (token.endsWith("ms") ? 1 : 1000) || 250;
    clearTimeout(finishTimer);
    finishTimer = setTimeout(
      clear,
      Math.max(0, minimum - (performance.now() - started)),
    );
  };
  const dispose = [
    nuxt.hook("page:loading:start", () => {
      if (!nuxt.isHydrating) {
        clearTimeout(finishTimer);
        started = performance.now();
        visible.value = true;
      }
    }),
    nuxt.hook("page:loading:end", hide),
    nuxt.hook("app:error", clear),
    nuxt.hook("vue:error", clear),
    useRouter().onError(clear),
  ];
  onScopeDispose(() => {
    clear();
    dispose.forEach((remove) => remove());
  });
}
</script>
<template>
  <div
    class="route-progress"
    :class="{
      'route-progress--visible': visible,
      'route-progress--banner': overBanner,
    }"
    aria-hidden="true"
  >
    <div class="route-progress__track">
      <span
        class="route-progress__line route-progress__line--1"
        :class="{
          'route-progress__line--wave': site.progressIndicator.style === 'wave',
        }"
      />
      <span
        v-if="site.progressIndicator.style === 'dual'"
        class="route-progress__line route-progress__line--2"
      />
    </div>
  </div>
</template>
<style>
/* Ported from RouteProgress.svelte and the linear indeterminate subset of
   ProgressIndicator.svelte. 3px clipping, 4px track/gap, 1750ms head/tail timings
   are the original M3 indicator geometry, not generic transition durations. */
@property --route-head-1 {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
@property --route-tail-1 {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
@property --route-head-2 {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
@property --route-tail-2 {
  syntax: "<number>";
  inherits: true;
  initial-value: 0;
}
.route-progress {
  position: fixed;
  top: 4rem;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 65;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  transition:
    top var(--m3e-duration-short) var(--m3e-easing-standard),
    opacity var(--m3e-duration-short) var(--m3e-easing-standard);
}
.route-progress--visible {
  opacity: 1;
}
.route-progress--banner {
  top: 0;
}
.route-progress__track {
  position: relative;
  width: 100%;
  height: 4px;
  background: var(--surface-container-highest);
  border-radius: var(--shape-corner-full);
}
.route-progress__line {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: var(--shape-corner-full);
  background: var(--primary);
}
.route-progress__line--1 {
  left: calc(var(--route-tail-1) * 100% + 2px);
  width: calc((var(--route-head-1) - var(--route-tail-1)) * 100% - 4px);
  animation:
    route-head-1 1750ms linear infinite,
    route-tail-1 1750ms linear infinite;
}
.route-progress__line--2 {
  left: calc(var(--route-tail-2) * 100% + 2px);
  width: calc((var(--route-head-2) - var(--route-tail-2)) * 100% - 4px);
  animation:
    route-head-2 1750ms linear infinite,
    route-tail-2 1750ms linear infinite;
}
.route-progress__line--wave {
  height: 8px;
  top: 50%;
  transform: translateY(-50%);
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='8'%3E%3Cpath d='M0 1 Q 10 7, 20 1 T 40 1 L 40 7 Q 30 1, 20 7 T 0 7 Z'/%3E%3C/svg%3E");
  mask-repeat: repeat-x;
  mask-size: 40px 8px;
  animation:
    route-head-1 1750ms linear infinite,
    route-tail-1 1750ms linear infinite,
    route-wave 900ms linear infinite;
}
.route-progress:not(.route-progress--visible) .route-progress__line {
  animation-play-state: paused;
}
@keyframes route-head-1 {
  0% {
    --route-head-1: 0;
  }
  57.14%,
  100% {
    --route-head-1: 1;
  }
}
@keyframes route-tail-1 {
  0%,
  14.29% {
    --route-tail-1: 0;
  }
  71.43%,
  100% {
    --route-tail-1: 1;
  }
}
@keyframes route-head-2 {
  0%,
  37.14% {
    --route-head-2: 0;
  }
  85.71%,
  100% {
    --route-head-2: 1;
  }
}
@keyframes route-tail-2 {
  0%,
  51.43% {
    --route-tail-2: 0;
  }
  100% {
    --route-tail-2: 1;
  }
}
@keyframes route-wave {
  from {
    mask-position: 0 0;
  }
  to {
    mask-position: 40px 0;
  }
}
@media (max-width: 1023px) {
  .public-site:not(.home-page) .route-progress {
    top: 4rem;
  }
}
/* A static visible segment retains loading feedback with either motion preference. */
html.motion-reduced .route-progress {
  transition: none;
}
html.motion-reduced .route-progress__line {
  animation: none;
  left: 2px;
  width: calc(50% - 4px);
}
html.motion-reduced .route-progress__line--2 {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .route-progress {
    transition: none;
  }
  .route-progress__line {
    animation: none;
    left: 2px;
    width: calc(50% - 4px);
  }
  .route-progress__line--2 {
    display: none;
  }
}
</style>
