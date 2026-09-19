<script setup lang="ts">
import { domains } from "#shared/schemas/content";
definePageMeta({ layout: "admin" });
const { snapshot, failure } = useAdmin();
const { t } = useCopy();
</script>
<template>
  <section>
    <h1>{{ t("overview") }}</h1>
    <p v-if="failure" role="alert">{{ failure }}</p>
    <p v-if="snapshot" class="notice">
      {{ t("date") }} · {{ snapshot.updatedAt }}
    </p>
    <div v-if="snapshot" class="grid">
      <NuxtLink
        v-for="domain in domains"
        :key="domain"
        class="panel"
        :to="`/admin/${domain}`"
        ><h2>{{ t(domain) }}</h2>
        <p>{{ snapshot.collections[domain].length }}</p></NuxtLink
      >
    </div>
  </section>
</template>
