<script setup lang="ts">
import { clearError } from "#app";
defineProps<{ error: { statusCode?: number; message?: string } }>();
const { t } = useCopy();
</script>
<template>
  <main class="panel" style="max-width: 700px; margin: 10vh auto">
    <h1>{{ error.statusCode }} · {{ t("notFound") }}</h1>
    <button @click="clearError({ redirect: '/' })">{{ t("homeLink") }}</button>
  </main>
</template>
