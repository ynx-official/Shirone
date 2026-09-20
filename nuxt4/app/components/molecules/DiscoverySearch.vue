<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
const value = defineModel<string>({ required: true });
const emit = defineEmits<{ change: [] }>();
const { t } = useCopy();
const input = ref<HTMLInputElement>();
function clear() {
  value.value = "";
  emit("change");
  input.value?.focus();
}
</script>
<template>
  <div class="discovery-search">
    <LocalIcon name="search" /><input
      ref="input"
      v-model="value"
      type="search"
      name="q"
      :aria-label="t('search')"
      :placeholder="t('search')"
      @input="emit('change')"
    /><button
      v-if="value"
      type="button"
      :aria-label="t('clear')"
      @click="clear"
    >
      <LocalIcon name="close" />
    </button>
  </div>
</template>
<style scoped>
.discovery-search {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  min-width: 0;
}
.discovery-search > svg {
  position: absolute;
  left: 0.75rem;
  color: var(--on-surface-variant);
}
.discovery-search input {
  width: 100%;
  min-width: 0;
  height: 3rem;
  padding: 0 2.75rem;
  border: 1px solid var(--outline-variant);
  border-radius: var(--shape-corner-l);
  background: var(--surface);
  font: var(--m3e-type-body-large);
}
input::-webkit-search-cancel-button {
  display: none;
}
.discovery-search button {
  position: absolute;
  right: 0.5rem;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0.25rem;
  border: 0;
  border-radius: var(--shape-corner-full);
  background: transparent;
  color: var(--on-surface-variant);
}
button:hover {
  background: color-mix(in oklab, var(--on-surface) 8%, transparent);
}
</style>
