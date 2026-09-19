<script setup lang="ts">
import type { Site } from "#shared/types/content";
const props = defineProps<{
  site: Site;
  home: boolean;
  title: string;
  description?: string;
}>();
const subtitle = ref(props.site.bannerOptions.homeText.subtitle[0] || "");
let timer: ReturnType<typeof setTimeout> | undefined;
const id = useId().replaceAll(":", "");
function path(amplitude: number, baseline: number, inverted = false) {
  let d = `M -768 ${baseline}`;
  const sign = inverted ? -1 : 1;
  for (let x = -768; x < 1024; x += 128)
    d += ` C ${x + 16} ${baseline - amplitude * sign} ${x + 48} ${baseline - amplitude * sign} ${x + 64} ${baseline} C ${x + 80} ${baseline + amplitude * sign} ${x + 112} ${baseline + amplitude * sign} ${x + 128} ${baseline}`;
  return d + " V 60 H -768 Z";
}
onMounted(() => {
  const settings = props.site.bannerOptions.homeText.typewriter;
  if (
    !settings.enable ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  const texts = props.site.bannerOptions.homeText.subtitle;
  let index = 0,
    position = texts[0]?.length || 0,
    deleting = true;
  const tick = () => {
    const value = texts[index] || "";
    position += deleting ? -1 : 1;
    subtitle.value = value.slice(0, Math.max(0, position));
    let delay = deleting ? settings.deleteSpeed : settings.speed;
    if (position <= 0) {
      deleting = false;
      index = (index + 1) % texts.length;
      delay = settings.speed;
    }
    if (!deleting && position >= value.length) {
      if (!settings.loop) return;
      deleting = true;
      delay = settings.pauseTime;
    }
    timer = setTimeout(tick, delay);
  };
  timer = setTimeout(tick, settings.pauseTime);
});
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <section
    class="banner"
    :class="{ 'banner-context': !home }"
    :aria-label="home ? site.bannerOptions.homeText.title : title"
    :style="{
      '--banner-dim': site.bannerOptions.dim.enable
        ? site.bannerOptions.dim.opacity
        : 0,
    }"
  >
    <picture class="banner-media"
      ><source media="(max-width:1023px)" :srcset="site.bannerMobile" />
      <img
        :src="site.banner"
        alt=""
        width="1920"
        height="1080"
        fetchpriority="high"
        :style="{ objectPosition: site.bannerOptions.position }"
    /></picture>
    <div class="banner-shade" />
    <div class="banner-copy">
      <template v-if="home"
        ><h1>{{ site.bannerOptions.homeText.title }}</h1>
        <p>{{ subtitle }}</p></template
      ><template v-else
        ><div class="banner-title">{{ title }}</div>
        <span class="banner-divider" />
        <p v-if="description">{{ description }}</p></template
      >
    </div>
    <div
      v-if="site.bannerOptions.waves.enable"
      class="banner-waves"
      aria-hidden="true"
    >
      <svg viewBox="0 0 240 42" preserveAspectRatio="none">
        <defs>
          <path :id="id + 'a'" :d="path(14, 18)" />
          <path :id="id + 'b'" :d="path(12, 20, true)" />
        </defs>
        <g>
          <use
            v-for="(_, i) in 4"
            :key="i"
            :href="'#' + id + (i % 2 ? 'b' : 'a')"
            :class="`wave-layer wave-${i}`"
          />
        </g>
      </svg>
    </div>
  </section>
</template>
