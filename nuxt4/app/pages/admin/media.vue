<script setup lang="ts">
import { mediaRepository, type MediaRecord } from "~/repositories/media";
definePageMeta({ layout: "admin" });
const { snapshot } = useAdmin();
const { t } = useCopy();
const items = ref<(MediaRecord & { url: string })[]>([]),
  message = ref("");
let alive = true;
function release() {
  items.value.forEach((i) => URL.revokeObjectURL(i.url));
  items.value = [];
}
async function load() {
  const records = await mediaRepository.list();
  if (!alive) return;
  release();
  items.value = records.map((i) => ({
    ...i,
    url: URL.createObjectURL(i.blob),
  }));
}
async function upload(event: Event) {
  const input = event.target as HTMLInputElement;
  try {
    for (const file of input.files || []) await mediaRepository.add(file);
    await load();
    message.value = t("savedLocal");
  } catch {
    message.value = t("saveError");
  } finally {
    input.value = "";
  }
}
async function remove(id: string) {
  if (JSON.stringify(snapshot.value).includes(`media:${id}`)) {
    message.value = t("confirmDelete");
    return;
  }
  try {
    await mediaRepository.remove(id);
    await load();
  } catch {
    message.value = t("saveError");
  }
}
onMounted(() => load().catch(() => (message.value = t("saveError"))));
onBeforeUnmount(() => {
  alive = false;
  release();
});
</script>
<template>
  <section class="panel form-stack">
    <h1>{{ t("media") }}</h1>
    <label
      >{{ t("upload")
      }}<input
        type="file"
        :disabled="!snapshot"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple
        @change="upload"
    /></label>
    <p v-if="message" role="status">{{ message }}</p>
    <div class="media-grid">
      <article v-for="item in items" :key="item.id">
        <img :src="item.url" :alt="item.name" />
        <p>{{ item.name }}</p>
        <input
          :aria-label="t('media')"
          :value="`media:${item.id}`"
          readonly
        /><button @click="remove(item.id)">{{ t("deleteItem") }}</button>
      </article>
    </div>
  </section>
</template>
