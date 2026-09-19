<script setup lang="ts">
import data from "~/assets/icons.json";
const props = defineProps<{ name?: string }>();
const aliases: Record<string, string> = {
  home: "home-outline-rounded",
  search: "search-rounded",
  theme: "contrast",
  arrow: "chevron-right-rounded",
  menu: "menu-rounded",
  palette: "palette-outline",
  close: "close-rounded",
  down: "keyboard-arrow-down-rounded",
  up: "keyboard-arrow-up-rounded",
  pin: "keep-rounded",
  lock: "lock",
  date: "calendar-today-outline-rounded",
  category: "book-2-outline-rounded",
  words: "article-outline-rounded",
  tag: "tag-rounded",
  time: "schedule-outline-rounded",
  link: "link-rounded",
};
const icon = computed(
  () =>
    (data as Record<string, { body: string; width: number; height: number }>)[
      props.name?.includes(":")
        ? props.name
        : `material-symbols:${aliases[props.name || "home"] || props.name}`
    ],
);
</script>
<template>
  <!-- eslint-disable vue/no-v-html -- bundled, trusted SVG path data; no remote or user supplied markup -->
  <svg
    aria-hidden="true"
    :viewBox="`0 0 ${icon?.width || 24} ${icon?.height || 24}`"
    width="22"
    height="22"
    fill="currentColor"
    class="local-icon"
    v-html="icon?.body || ''"
  />
</template>
