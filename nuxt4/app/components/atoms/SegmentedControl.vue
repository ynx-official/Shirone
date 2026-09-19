<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
defineProps<{ label: string; options: { value: string; label: string }[] }>();
const value = defineModel<string>({ required: true });
const id = useId();
</script>
<template>
  <div class="settings-segments" role="radiogroup" :aria-label="label">
    <label
      v-for="option in options"
      :key="option.value"
      :class="{ selected: value === option.value }"
      ><input
        v-model="value"
        type="radio"
        :name="id"
        :value="option.value"
      /><LocalIcon
        v-if="value === option.value"
        name="material-symbols:check-rounded"
      /><span>{{ option.label }}</span></label
    >
  </div>
</template>
