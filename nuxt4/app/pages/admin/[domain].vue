<script setup lang="ts">
import {
  domains,
  entitySchema,
  type Domain,
  type Entity,
} from "#shared/schemas/content";
import { references } from "~/repositories/admin";
import JsonField from "~/components/admin/JsonField.vue";
definePageMeta({ layout: "admin" });
const route = useRoute();
const domain = computed(() => String(route.params.domain) as Domain);
if (!domains.includes(domain.value)) throw createError({ statusCode: 404 });
const { snapshot, failure, save } = useAdmin();
const { t } = useCopy();
const selected = ref<string>(),
  draft = ref<Entity>(),
  message = ref(""),
  query = ref("");
const statusFilter = ref("");
const items = computed(() =>
  (snapshot.value?.collections[domain.value] || []).filter(
    (e) =>
      (
        e.title +
        " " +
        e.description +
        " " +
        e.category +
        " " +
        e.tags.join(" ")
      )
        .toLowerCase()
        .includes(query.value.toLowerCase()) &&
      (!statusFilter.value || e.status === statusFilter.value),
  ),
);
watch(domain, () => {
  selected.value = undefined;
  draft.value = undefined;
  message.value = "";
  query.value = "";
});
function edit(item: Entity) {
  selected.value = item.id;
  draft.value = JSON.parse(JSON.stringify(item));
  message.value = "";
}
function create() {
  selected.value = undefined;
  draft.value = entitySchema.parse({
    id: crypto.randomUUID(),
    title: t("newItem"),
    status: domain.value === "posts" ? "draft" : "published",
  });
  if (domain.value === "albums")
    draft.value.data = { photos: [], layout: "masonry", columns: 3 };
  if (snapshot.value && domain.value !== "posts" && domain.value !== "albums") {
    const template = snapshot.value.collections[domain.value][0];
    if (template) draft.value.data = JSON.parse(JSON.stringify(template.data));
  }
  message.value = "";
}
async function commit() {
  if (!snapshot.value || !draft.value) return;
  const result = entitySchema.safeParse(draft.value);
  if (!result.success) {
    message.value = t("invalidData");
    return;
  }
  const next = JSON.parse(JSON.stringify(snapshot.value));
  const list = next.collections[domain.value] as Entity[];
  const index = list.findIndex((e) => e.id === selected.value);
  const old = index >= 0 ? list[index] : undefined;
  if (list.some((e, i) => e.id === result.data.id && i !== index)) {
    message.value = t("invalidData");
    return;
  }
  if (index >= 0) list[index] = result.data;
  else list.push(result.data);
  if (old && domain.value === "categories")
    for (const post of next.collections.posts)
      if (post.category === old.title) post.category = result.data.title;
  if (old && domain.value === "tags")
    for (const post of next.collections.posts)
      post.tags = post.tags.map((tag: string) =>
        tag === old.title ? result.data.title : tag,
      );
  if (old && domain.value === "series")
    for (const post of next.collections.posts)
      if (post.series === old.id) post.series = result.data.id;
  if (await save(next)) {
    selected.value = result.data.id;
    message.value = t("savedLocal");
  }
}
async function remove() {
  if (!snapshot.value || !draft.value || !selected.value) return;
  const refs = references(snapshot.value, domain.value, draft.value);
  if (refs.length) {
    message.value = t("confirmDelete") + " " + refs.join(", ");
    return;
  }
  if (!confirm(t("confirmDelete"))) return;
  const next = JSON.parse(JSON.stringify(snapshot.value));
  next.collections[domain.value] = next.collections[domain.value].filter(
    (e: Entity) => e.id !== selected.value,
  );
  if (await save(next)) {
    draft.value = undefined;
    selected.value = undefined;
    message.value = t("savedLocal");
  }
}
async function reorder(delta: number) {
  if (!snapshot.value || !selected.value) return;
  const next = JSON.parse(JSON.stringify(snapshot.value));
  const list = next.collections[domain.value] as Entity[];
  const index = list.findIndex((e) => e.id === selected.value);
  const target = index + delta;
  if (index < 0 || target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target]!, list[index]!];
  if (await save(next)) message.value = t("savedLocal");
}
async function preview() {
  await commit();
  if (message.value === t("savedLocal"))
    await navigateTo({
      path: "/admin/preview",
      query: { domain: domain.value, id: selected.value },
    });
}
</script>
<template>
  <section>
    <div
      class="row"
      style="justify-content: space-between; margin-bottom: 1rem"
    >
      <h1>{{ t(domain) }}</h1>
      <button v-if="domain !== 'settings'" @click="create">
        {{ t("newItem") }}
      </button>
    </div>
    <p v-if="failure" role="alert">{{ failure }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <div v-if="snapshot" class="admin-editor">
      <div>
        <label>{{ t("search") }}<input v-model="query" type="search" /></label>
        <label v-if="domain !== 'settings'"
          >{{ t("status")
          }}<select v-model="statusFilter">
            <option value="">—</option>
            <option value="draft">{{ t("draft") }}</option>
            <option value="published">{{ t("published") }}</option>
          </select></label
        >
        <div class="entity-list">
          <button
            v-for="item in items"
            :key="item.id"
            :class="{ selected: item.id === selected }"
            @click="edit(item)"
          >
            {{ item.title }}
          </button>
        </div>
      </div>
      <form v-if="draft" class="panel form-stack" @submit.prevent="commit">
        <label>{{ t("title") }}<input v-model="draft.title" required /></label
        ><label
          >{{ t("description") }}<textarea v-model="draft.description" /></label
        ><template v-if="domain !== 'settings'"
          ><div class="form-grid">
            <label>{{ t("date") }}<input v-model="draft.date" /></label
            ><label
              >{{ t("status")
              }}<select v-model="draft.status">
                <option value="draft">{{ t("draft") }}</option>
                <option value="published">{{ t("published") }}</option>
              </select></label
            >
          </div>
          <label v-if="['posts', 'moments', 'series'].includes(domain)"
            >{{ t("body")
            }}<textarea v-model="draft.body" class="markdown-input" /></label
          ><template v-if="domain === 'posts'"
            ><label
              >{{ t("categories")
              }}<input v-model="draft.category" list="categories" /></label
            ><datalist id="categories">
              <option
                v-for="item in snapshot.collections.categories"
                :key="item.id"
                :value="item.title"
              /></datalist
            ><label
              >{{ t("series")
              }}<select v-model="draft.series">
                <option value="">—</option>
                <option
                  v-for="item in snapshot.collections.series"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.title }}
                </option>
              </select></label
            ></template
          ><JsonField v-model="draft.tags" :label="t('tags')" /><label
            >{{ t("media") }}<input v-model="draft.image" /></label></template
        ><JsonField v-model="draft.data" :label="t('sourceData')" />
        <div class="row">
          <button
            v-if="selected && domain !== 'settings'"
            type="button"
            :aria-label="t('previous')"
            @click="reorder(-1)"
          >
            ↑
          </button>
          <button
            v-if="selected && domain !== 'settings'"
            type="button"
            :aria-label="t('next')"
            @click="reorder(1)"
          >
            ↓
          </button>
          <button type="submit">{{ t("saveLocal") }}</button
          ><button type="button" @click="preview">{{ t("preview") }}</button
          ><button v-if="selected" type="button" @click="remove">
            {{ t("deleteItem") }}
          </button>
        </div>
      </form>
      <p v-else>{{ t("selectItem") }}</p>
    </div>
  </section>
</template>
