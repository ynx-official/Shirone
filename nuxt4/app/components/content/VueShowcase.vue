<script setup lang="ts">
const { t } = useCopy();
const count = ref(0);
const title = ref("Vue 3");
const enabled = ref(true);
const progress = ref(50);
</script>
<template>
  <section class="panel form-stack" aria-label="Vue 3">
    <h2>Vue 3 · M3E</h2>
    <label>{{ t("title") }}<input v-model="title" /></label>
    <p aria-live="polite">{{ title }} · {{ count }}</p>
    <div class="row">
      <button :disabled="!enabled" @click="count++">
        {{ t("newItem") }} +1
      </button>
      <button @click="count = 0">{{ t("resetData") }}</button>
      <label
        ><input v-model="enabled" type="checkbox" />{{ t("enable") }}</label
      >
    </div>
    <label
      >{{ t("progress")
      }}<input v-model.number="progress" type="range" min="0" max="100"
    /></label>
    <progress :value="progress" max="100" :aria-label="t('progress')" />
  </section>
</template>
