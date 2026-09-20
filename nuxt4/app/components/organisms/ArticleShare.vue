<script setup lang="ts">
const props = defineProps<{ title: string; description: string }>();
const { t } = useCopy();
const message = ref(""),
  busy = ref(false),
  image = ref("");
const dialog = ref<HTMLDialogElement>();
let alive = true;
async function copy() {
  try {
    await navigator.clipboard.writeText(location.href);
    message.value = t("copySuccess");
  } catch {
    message.value = t("copyFailed");
  }
}
async function poster() {
  busy.value = true;
  try {
    const { createPoster } = await import("~/utils/share-poster");
    const blob = await createPoster(
      props.title,
      props.description,
      location.href,
    );
    if (!alive) return;
    if (image.value) URL.revokeObjectURL(image.value);
    image.value = URL.createObjectURL(blob);
    dialog.value?.showModal();
  } catch {
    message.value = t("sharePosterFailed");
  } finally {
    busy.value = false;
  }
}
onBeforeUnmount(() => {
  alive = false;
  if (image.value) URL.revokeObjectURL(image.value);
});
</script>
<template>
  <section class="article-share" :aria-label="t('shareArticle')">
    <div class="article-share-heading">
      <h2>{{ t("shareArticle") }}</h2>
      <p>{{ t("shareArticleDescription") }}</p>
    </div>
    <div class="row article-share-actions">
      <button @click="copy">{{ t("copyLink") }}</button
      ><button :disabled="busy" @click="poster">
        {{ t(busy ? "generatingSharePoster" : "generateSharePoster") }}</button
      ><span role="status" class="article-share-status">{{ message }}</span>
    </div>
    <dialog ref="dialog" class="panel">
      <button @click="dialog?.close()">{{ t("close") }}</button
      ><img
        v-if="image"
        :src="image"
        :alt="t('sharePosterPreviewAlt')"
        width="1000"
        height="700"
        style="max-height: 70vh; width: auto"
      /><a class="button" :href="image" download="article.png">{{
        t("downloadSharePoster")
      }}</a>
    </dialog>
  </section>
</template>
