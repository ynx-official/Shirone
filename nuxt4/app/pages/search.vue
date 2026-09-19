<script setup lang="ts">
const hydrated = ref(false);
onMounted(() => {
  hydrated.value = true;
});
const { t } = useCopy();
const query = ref(""),
  results = ref<{ url: string; meta: { title: string }; excerpt: string }[]>(
    [],
  ),
  busy = ref(false);
const failure = ref("");
let counter = 0;
onBeforeUnmount(() => {
  counter++;
});
async function search() {
  const current = ++counter;
  if (!query.value.trim()) {
    results.value = [];
    return;
  }
  busy.value = true;
  failure.value = "";
  try {
    const path = "/pagefind/pagefind.js";
    const pagefind = await import(/* @vite-ignore */ path);
    const response = await pagefind.search(query.value);
    const data = await Promise.all(
      response.results.slice(0, 30).map((r: any) => r.data()),
    );
    if (current === counter) results.value = data;
  } catch {
    if (current === counter) failure.value = t("searchError");
  } finally {
    if (current === counter) busy.value = false;
  }
}
</script>
<template>
  <section class="panel">
    <h1>{{ t("search") }}</h1>
    <form class="row" @submit.prevent="search">
      <label style="flex: 1"
        >{{ t("search")
        }}<input
          v-model="query"
          :placeholder="t('searchPlaceholder')"
          type="search"
          :disabled="!hydrated" /></label
      ><button :disabled="busy || !hydrated">{{ t("search") }}</button>
    </form>
    <p v-if="failure" role="alert">{{ failure }}</p>
    <article
      v-for="result in results"
      :key="result.url"
      style="margin-top: 1.5rem"
    >
      <h2>
        <NuxtLink :to="result.url">{{ result.meta.title }}</NuxtLink>
      </h2>
      <p>{{ result.excerpt.replace(/<[^>]*>/g, "") }}</p>
    </article>
  </section>
</template>
