<script setup lang="ts">
import {
  CloudUploadOutlined,
  SearchOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CopyOutlined,
  DeleteOutlined,
} from "@antdv-next/icons";
import { mediaRepository, type MediaRecord } from "~/repositories/media";
definePageMeta({ layout: "admin" });
const { snapshot, failure } = useAdmin();
const { t } = useCopy();
const items = ref<(MediaRecord & { url: string; dimensions?: string })[]>([]);
const message = ref("");
const query = ref("");
const view = ref<"grid" | "list">("grid");
const filteredItems = computed(() =>
  items.value.filter((item) =>
    item.name
      .toLocaleLowerCase()
      .includes(query.value.trim().toLocaleLowerCase()),
  ),
);
const busy = ref(false),
  loading = ref(true),
  cleanOpen = ref(false);
const fileInput = ref<HTMLInputElement>();
let alive = true;
function release() {
  items.value.forEach((item) => URL.revokeObjectURL(item.url));
  items.value = [];
}
async function load() {
  const records = await mediaRepository.list();
  if (!alive) return;
  release();
  items.value = records.map((item) => ({
    ...item,
    url: URL.createObjectURL(item.blob),
  }));
}
// Count referring entities, including structured fields and Markdown bodies.
function referenceCount(id: string) {
  if (!snapshot.value) return 0;
  return Object.values(snapshot.value.collections)
    .flat()
    .filter((entity) => JSON.stringify(entity).includes(`media:${id}`)).length;
}
const unused = computed(() =>
  items.value.filter((item) => !referenceCount(item.id)),
);
async function upload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!snapshot.value || busy.value) return;
  busy.value = true;
  message.value = "";
  try {
    for (const file of input.files || []) await mediaRepository.add(file);
    message.value = t("savedLocal");
  } catch {
    message.value = t("saveError") + " " + t("adminUploadHint");
  } finally {
    try {
      await load();
    } catch {
      message.value = t("saveError");
    }
    busy.value = false;
    input.value = "";
  }
}
async function remove(id: string) {
  if (!snapshot.value || busy.value || referenceCount(id)) return;
  busy.value = true;
  try {
    await mediaRepository.remove(id);
    await load();
    message.value = t("savedLocal");
  } catch {
    message.value = t("saveError");
  } finally {
    busy.value = false;
  }
}
async function clean() {
  if (!snapshot.value || busy.value) return;
  busy.value = true;
  try {
    await mediaRepository.removeMany(unused.value.map((item) => item.id));
    await load();
    cleanOpen.value = false;
    message.value = t("savedLocal");
  } catch {
    message.value = t("saveError");
  } finally {
    busy.value = false;
  }
}
async function copy(id: string) {
  try {
    await navigator.clipboard.writeText(`media:${id}`);
    message.value = t("copySuccess");
  } catch {
    message.value = t("copyFailed");
  }
}
function dimensions(event: Event, item: (typeof items.value)[number]) {
  const image = event.target as HTMLImageElement;
  item.dimensions = `${image.naturalWidth} × ${image.naturalHeight}`;
}
onMounted(async () => {
  try {
    await load();
  } catch {
    message.value = t("saveError");
  } finally {
    loading.value = false;
  }
});
onBeforeUnmount(() => {
  alive = false;
  release();
});
</script>
<template>
  <section>
    <div class="admin-page-heading">
      <div>
        <h1>{{ t("media") }}</h1>
        <p>{{ t("adminMediaDescription") }}</p>
      </div>
      <AButton
        :disabled="!snapshot || !unused.length || busy"
        @click="cleanOpen = true"
        >{{ t("adminCleanUnused") }}</AButton
      >
    </div>
    <div class="admin-upload">
      <CloudUploadOutlined class="admin-upload-icon" aria-hidden="true" />
      <div class="admin-upload-copy">
        <h2>{{ t("upload") }}</h2>
        <p>{{ t("adminUploadHint") }}</p>
      </div>
      <input
        ref="fileInput"
        class="admin-file-input"
        type="file"
        :aria-label="t('upload')"
        :disabled="!snapshot || busy"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple
        @change="upload"
      />
      <AButton
        type="primary"
        :loading="busy"
        :disabled="!snapshot"
        @click="fileInput?.click()"
        ><CloudUploadOutlined aria-hidden="true" />{{
          t("adminChooseImages")
        }}</AButton
      >
    </div>
    <div class="admin-media-toolbar">
      <AInput
        v-model:value="query"
        :aria-label="t('adminMediaSearch')"
        :placeholder="t('adminMediaSearch')"
        allow-clear
        ><template #prefix><SearchOutlined aria-hidden="true" /></template
      ></AInput>
      <span class="admin-media-total">{{
        t("adminMediaTotal").replace("{count}", String(filteredItems.length))
      }}</span>
      <div class="admin-view-switch">
        <AButton
          :type="view === 'grid' ? 'primary' : 'default'"
          :aria-label="t('adminGridView')"
          :aria-pressed="view === 'grid'"
          @click="view = 'grid'"
          ><AppstoreOutlined
        /></AButton>
        <AButton
          :type="view === 'list' ? 'primary' : 'default'"
          :aria-label="t('adminListView')"
          :aria-pressed="view === 'list'"
          @click="view = 'list'"
          ><UnorderedListOutlined
        /></AButton>
      </div>
    </div>
    <p v-if="message" class="admin-media-message" role="status">
      {{ message }}
    </p>
    <AAlert v-if="failure" type="error" :title="failure" show-icon />
    <ASkeleton v-if="loading" active />
    <AEmpty v-else-if="!filteredItems.length" :description="t('empty')" />
    <div v-else class="media-grid" :class="{ 'is-list': view === 'list' }">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        class="admin-media-card"
      >
        <img
          :src="item.url"
          :alt="item.name"
          loading="lazy"
          @load="dimensions($event, item)"
        />
        <div class="admin-media-details">
          <div class="admin-media-caption">
            <h3 :title="item.name">{{ item.name }}</h3>
            <p>
              {{
                item.size >= 1048576
                  ? `${(item.size / 1048576).toFixed(1)} MB`
                  : `${(item.size / 1024).toFixed(1)} KB`
              }}<template v-if="item.dimensions">
                · {{ item.dimensions }}</template
              >
              ·
              {{
                t("adminReferenceCount").replace(
                  "{count}",
                  String(referenceCount(item.id)),
                )
              }}
            </p>
          </div>
          <div class="admin-media-actions">
            <span v-if="referenceCount(item.id)" class="admin-used">{{
              t("adminReferenced")
            }}</span>
            <APopconfirm
              v-else
              :title="t('confirmDelete')"
              :ok-text="t('deleteItem')"
              :cancel-text="t('cancel')"
              @confirm="remove(item.id)"
              ><AButton
                size="small"
                :aria-label="t('deleteItem')"
                :title="t('deleteItem')"
                :disabled="!snapshot || busy"
                ><DeleteOutlined aria-hidden="true" /></AButton
            ></APopconfirm>
            <AButton
              size="small"
              :aria-label="t('adminCopyReference')"
              :title="t('adminCopyReference')"
              @click="copy(item.id)"
              ><CopyOutlined aria-hidden="true"
            /></AButton>
          </div>
        </div>
      </article>
    </div>
    <AModal
      v-model:open="cleanOpen"
      :title="t('adminCleanUnused')"
      :ok-text="t('deleteItem')"
      :cancel-text="t('cancel')"
      :ok-button-props="{ danger: true }"
      :confirm-loading="busy"
      @ok="clean"
      ><p>{{ t("adminCleanConfirm") }}</p></AModal
    >
  </section>
</template>
