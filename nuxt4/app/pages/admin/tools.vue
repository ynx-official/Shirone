<script setup lang="ts">
import { validateSnapshot } from "~/repositories/admin";
import { mediaRepository } from "~/repositories/media";
definePageMeta({ layout: "admin" });
const { snapshot, failure, save, reset } = useAdmin();
const { t } = useCopy();
const message = ref("");
function download() {
  if (!snapshot.value) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(snapshot.value, null, 2)], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "shirone-local.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function upload(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const data = validateSnapshot(JSON.parse(await file.text()));
    if (await save(data)) message.value = t("savedLocal");
  } catch {
    message.value = t("invalidData");
  } finally {
    input.value = "";
  }
}
async function clear() {
  if (!confirm(t("confirmReset"))) return;
  try {
    await mediaRepository.clear();
    await reset();
    message.value = failure.value || t("savedLocal");
  } catch {
    message.value = t("saveError");
  }
}
</script>
<template>
  <section class="panel form-stack">
    <h1>{{ t("dataTools") }}</h1>
    <p v-if="message || failure" role="status">{{ message || failure }}</p>
    <p v-if="snapshot">
      {{ t("storage") }}:
      {{ (JSON.stringify(snapshot).length / 1024).toFixed(1) }} KB
    </p>
    <AButton @click="download">{{ t("exportData") }}</AButton
    ><label
      >{{ t("importData")
      }}<input
        type="file"
        accept="application/json,.json"
        :disabled="!snapshot"
        @change="upload" /></label
    ><AButton @click="clear">{{ t("resetData") }}</AButton>
  </section>
</template>
