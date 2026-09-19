<script setup lang="ts">
const props = defineProps<{ config: any }>();
const root = ref<HTMLElement>();
const { t } = useCopy();
let alive = true;
let script: HTMLScriptElement | undefined;
onMounted(async () => {
  const c = props.config;
  if (c.provider === "giscus" && c.giscus.repo && c.giscus.repoId) {
    script = document.createElement("script");
    script.src = c.giscus.scriptUrl;
    script.async = true;
    script.crossOrigin = "anonymous";
    const g = c.giscus;
    for (const [key, value] of Object.entries({
      repo: g.repo,
      "repo-id": g.repoId,
      category: g.category,
      "category-id": g.categoryId,
      mapping: g.mapping,
      strict: g.strict ? "1" : "0",
      "reactions-enabled": g.reactionsEnabled ? "1" : "0",
      "emit-metadata": g.emitMetadata ? "1" : "0",
      "input-position": g.inputPosition,
      theme: document.documentElement.classList.contains("dark")
        ? g.theme.dark
        : g.theme.light,
      lang: g.lang === "auto" ? document.documentElement.lang : g.lang,
    }))
      script.setAttribute("data-" + key, String(value));
    root.value?.append(script);
  } else if (c.provider === "twikoo" && c.twikoo.envId) {
    script = document.createElement("script");
    script.src = c.twikoo.scriptUrl;
    script.async = true;
    script.onload = () => {
      if (alive && root.value)
        (window as any).twikoo?.init({
          envId: c.twikoo.envId,
          el: root.value,
          lang: c.twikoo.lang === "auto" ? undefined : c.twikoo.lang,
        });
    };
    root.value?.append(script);
  }
});
onBeforeUnmount(() => {
  alive = false;
  script?.remove();
});
</script>
<template>
  <section class="panel">
    <h2>{{ t("comments") }}</h2>
    <div ref="root" />
  </section>
</template>
