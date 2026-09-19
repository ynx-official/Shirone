<script setup lang="ts">
import type { Entity } from "#shared/types/content";
const { t } = useCopy();
const props = defineProps<{ item: Entity; domain: string }>();
const href = computed(() =>
  props.domain === "albums"
    ? `/albums/${props.item.id}/`
    : props.domain === "series"
      ? `/series/${props.item.id}/`
      : String(
          props.item.data.link ||
            props.item.data.siteurl ||
            props.item.data.href ||
            props.item.data.url ||
            props.item.data.repository ||
            "",
        ),
);
const safeHref = computed(() =>
  /^(https?:\/\/|\/(?!\/))/.test(href.value) ? href.value : "",
);
const status = computed(() => {
  const value = props.item.data.status || props.item.data.phase;
  if (!value) return "";
  const prefix = (
    {
      anime: "animeStatus",
      devices: "devicesStatus",
      games: "gamesStatus",
      projects: "projectPhase",
    } as Record<string, string>
  )[props.domain];
  return prefix
    ? t(
        prefix +
          String(value)
            .split("-")
            .map((s) => s[0]?.toUpperCase() + s.slice(1))
            .join(""),
      )
    : String(value);
});
</script>
<template>
  <article class="panel">
    <img
      v-if="item.image && /^(https?:|\/)/.test(item.image)"
      :src="item.image"
      :alt="item.title"
      class="tile-image"
      width="480"
      height="300"
      loading="lazy"
    />
    <p v-if="item.date" class="eyebrow">{{ item.date.slice(0, 10) }}</p>
    <h2>
      <NuxtLink
        v-if="safeHref"
        :to="safeHref"
        :external="safeHref.startsWith('http')"
        :rel="safeHref.startsWith('http') ? 'noopener noreferrer' : undefined"
        >{{ item.title }}</NuxtLink
      ><span v-else>{{ item.title }}</span>
    </h2>
    <p class="muted">{{ item.description }}</p>
    <p v-if="item.data.specs">{{ item.data.specs }}</p>
    <p
      v-if="
        item.data.brand ||
        item.data.studio ||
        item.data.developer ||
        item.data.year
      "
      class="muted"
    >
      {{
        [item.data.brand, item.data.studio, item.data.developer, item.data.year]
          .filter(Boolean)
          .join(" · ")
      }}
    </p>
    <div class="row">
      <span v-if="status" class="chip">{{ status }}</span>
      <span v-if="item.data.rating" class="chip"
        >{{ t("gamesRating") }} · {{ item.data.rating }}</span
      >
      <span v-if="item.data.hours" class="chip"
        >{{ t("gamesHours") }} · {{ item.data.hours }}</span
      >
      <span v-if="item.data.platform" class="chip">{{
        item.data.platform
      }}</span>
      <span v-if="item.data.level" class="chip">{{
        t(
          "skillLevel" +
            String(item.data.level).charAt(0).toUpperCase() +
            String(item.data.level).slice(1),
        )
      }}</span>
      <span
        v-for="value in item.data.technologies || item.data.genres || []"
        :key="value"
        class="chip"
        >{{ value }}</span
      >
      <span v-for="tag in item.tags" :key="tag" class="chip">{{ tag }}</span
      ><span v-if="item.category" class="chip">{{
        item.data.categoryLabel || item.category
      }}</span>
    </div>
    <p v-if="item.data.progress">
      {{ t("progress") }} · {{ item.data.progress.watched }} /
      {{ item.data.progress.total }}
    </p>
    <ul v-if="item.data.highlights">
      <li v-for="value in item.data.highlights" :key="value">{{ value }}</li>
    </ul>
    <p v-for="(link, index) in item.data.links || []" :key="index">
      <a
        v-if="/^https?:/.test(link.url)"
        :href="link.url"
        rel="noopener noreferrer"
        >{{ link.label }}</a
      >
    </p>
    <template v-if="Array.isArray(item.data.entries)"
      ><p v-for="(entry, i) in item.data.entries" :key="i">
        <a
          v-if="/^https?:/.test(entry.href)"
          :href="entry.href"
          rel="noopener noreferrer"
          >{{ entry.label }}</a
        ><span v-else>{{ entry.label }}</span>
      </p></template
    >
  </article>
</template>
