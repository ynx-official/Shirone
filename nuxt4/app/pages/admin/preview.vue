<script setup lang="ts">
import AlbumView from "~/components/organisms/AlbumView.vue";
import DataTile from "~/components/molecules/DataTile.vue";
import type { Entity } from "#shared/types/content";
import type { Domain } from "#shared/schemas/content";
import MarkdownBody from "~/components/content/MarkdownBody.vue";
import JsonField from "~/components/admin/JsonField.vue";
import { mediaRepository } from "~/repositories/media";
definePageMeta({ layout: "admin" });
const route = useRoute(),
  { snapshot } = useAdmin(),
  { t } = useCopy();
const styles = ref<string[]>([]),
  syntaxes = ref<string[]>([]);
const previewError = ref("");
const resolved = ref<Entity>();
const html = ref(""),
  image = ref("");
let generation = 0;
const urls: string[] = [];
const item = computed(() =>
  snapshot.value?.collections[String(route.query.domain) as Domain]?.find(
    (e) => e.id === route.query.id,
  ),
);
watch(
  item,
  async (value) => {
    const current = ++generation;
    urls.splice(0).forEach(URL.revokeObjectURL);
    resolved.value = undefined;
    image.value = "";
    html.value = "";
    previewError.value = "";
    if (!value) return;
    try {
      const { compilePreview } = await import("~/utils/preview");
      let encoded = JSON.stringify(value);
      let source = value.body;
      const media = await mediaRepository.list();
      for (const record of media) {
        const uri = `media:${record.id}`;
        if (encoded.includes(uri)) {
          const url = URL.createObjectURL(record.blob);
          urls.push(url);
          source = source.replaceAll(uri, url);
          encoded = encoded.replaceAll(uri, url);
          if (value.image === uri) image.value = url;
        }
      }
      const result = source
        ? await compilePreview(source)
        : { html: "", styles: [], syntaxes: [] };
      if (current !== generation) return;
      resolved.value = JSON.parse(encoded);
      html.value = result.html;
      styles.value = result.styles;
      syntaxes.value = result.syntaxes;
      if (!value.image.startsWith("media:")) image.value = value.image;
    } catch {
      if (current === generation) previewError.value = t("invalidData");
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  generation++;
  urls.forEach(URL.revokeObjectURL);
});
</script>
<template>
  <section class="panel">
    <h1>{{ t("preview") }}</h1>
    <p class="notice">{{ t("localOnly") }}</p>
    <p v-if="previewError" role="alert">{{ previewError }}</p>
    <AlbumView
      v-if="resolved && route.query.domain === 'albums'"
      :item="resolved"
    />
    <DataTile
      v-else-if="
        resolved &&
        !['posts', 'moments', 'series', 'settings'].includes(
          String(route.query.domain),
        )
      "
      :item="resolved"
      :domain="String(route.query.domain)"
    />
    <article v-else-if="item">
      <h2>{{ item.title }}</h2>
      <p>{{ item.description }}</p>
      <img
        v-if="image"
        :src="image"
        :alt="item.title"
        width="800"
        height="450"
      /><MarkdownBody
        v-if="html"
        :html="html"
        :styles="styles"
        :syntaxes="syntaxes"
      />
      <div v-if="route.query.domain === 'settings'" inert>
        <JsonField :model-value="item.data" :label="t('settings')" />
      </div>
    </article>
  </section>
</template>
