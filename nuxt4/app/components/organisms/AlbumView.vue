<script setup lang="ts">
const hydrated = ref(false);
onMounted(() => {
  hydrated.value = true;
});
import type { Entity } from "#shared/types/content";
import { decrypt } from "~/utils/decrypt";
const props = defineProps<{ item: Entity }>();
const { t } = useCopy();
const password = ref(""),
  error = ref(false);
const photos = ref<any[]>(props.item.data.photos || []);
const selected = ref<string>();
const dialog = ref<HTMLDialogElement>();
watch(
  () => props.item,
  (item) => {
    photos.value = item.data.photos || [];
    password.value = "";
    error.value = false;
    selected.value = undefined;
    dialog.value?.close();
  },
);
async function unlock() {
  try {
    const result = await decrypt<{ photos: any[] }>(
      props.item.data.cipher,
      password.value,
    );
    photos.value = result.photos;
    password.value = "";
    error.value = false;
  } catch {
    error.value = true;
  }
}
function open(src: string) {
  selected.value = src;
  dialog.value?.showModal();
}
</script>
<template>
  <section class="panel">
    <h1>{{ item.title }}</h1>
    <p>{{ item.description }}</p>
    <form v-if="item.data.protected && !photos.length" @submit.prevent="unlock">
      <label
        >{{ t("password")
        }}<input
          v-model="password"
          type="password"
          :disabled="!hydrated"
          required /></label
      ><button :disabled="!hydrated">{{ t("unlock") }}</button>
      <p v-if="error" role="alert">{{ t("unlockError") }}</p>
    </form>
    <div class="grid">
      <button
        v-for="(photo, i) in photos"
        :key="i"
        :aria-label="photo.alt || item.title"
        @click="open(photo.src)"
      >
        <img
          :src="photo.thumbnail || photo.src"
          :alt="photo.alt || ''"
          :width="photo.width || 600"
          :height="photo.height || 400"
          loading="lazy"
        />
      </button>
    </div>
    <dialog
      ref="dialog"
      class="panel"
      @click="
        (e) => {
          if (e.target === dialog) dialog?.close();
        }
      "
    >
      <button @click="dialog?.close()">{{ t("back") }}</button
      ><img
        v-if="selected"
        :src="selected"
        :alt="item.title"
        style="max-height: 80vh"
      />
    </dialog>
  </section>
</template>
