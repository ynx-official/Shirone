<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
defineProps<{ title: string; subtitle: string; icon: string }>();
</script>
<template>
  <header class="discovery-heading">
    <div>
      <LocalIcon :name="icon" />
      <h1>{{ title }}</h1>
    </div>
    <p>{{ subtitle }}</p>
  </header>
</template>
<style scoped>
.discovery-heading {
  margin-bottom: 1.5rem;
}
.discovery-heading > div {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.discovery-heading svg {
  width: 2rem;
  height: 2rem;
  color: var(--primary);
}
.discovery-heading h1 {
  margin: 0;
  color: var(--on-surface);
  font: var(--m3e-type-headline-medium);
  font-weight: 700;
  line-height: 1.2;
}
.discovery-heading p {
  margin: 0.375rem 0 0;
  color: var(--on-surface-variant);
  font: var(--m3e-type-body-medium);
  line-height: 1.5;
}
</style>
