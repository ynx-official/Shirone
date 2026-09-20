<script setup lang="ts">
import {
  FileTextOutlined,
  EditOutlined,
  MessageOutlined,
  PictureOutlined,
  ArrowRightOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  ToolOutlined,
} from "@antdv-next/icons";
import { domains } from "#shared/schemas/content";
definePageMeta({ layout: "admin" });
const { snapshot, failure } = useAdmin();
const { t, locale } = useCopy();
const posts = computed(() => snapshot.value?.collections.posts || []);
const drafts = computed(() =>
  posts.value.filter((post) => post.status === "draft"),
);
const recent = computed(() =>
  [...posts.value]
    .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
    .slice(0, 6),
);
const metrics = computed(() => [
  {
    key: "posts",
    value: posts.value.length,
    icon: FileTextOutlined,
    path: "/admin/posts",
  },
  {
    key: "draft",
    value: drafts.value.length,
    icon: EditOutlined,
    path: "/admin/posts",
  },
  {
    key: "moments",
    value: snapshot.value?.collections.moments.length || 0,
    icon: MessageOutlined,
    path: "/admin/moments",
  },
  {
    key: "albums",
    value: snapshot.value?.collections.albums.length || 0,
    icon: PictureOutlined,
    path: "/admin/albums",
  },
]);
const modules = domains.filter(
  (domain) => !["posts", "moments", "albums", "settings"].includes(domain),
);
const actions = [
  { key: "posts", path: "/admin/posts", icon: EditOutlined },
  { key: "upload", path: "/admin/media", icon: CloudUploadOutlined },
  { key: "settings", path: "/admin/settings", icon: SettingOutlined },
  { key: "dataTools", path: "/admin/tools", icon: ToolOutlined },
];
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(locale.value.replace("_", "-"), {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}
</script>
<template>
  <section class="admin-dashboard">
    <div class="admin-page-heading">
      <div>
        <h1>{{ t("overview") }}</h1>
        <p>{{ t("adminOverviewIntro") }}</p>
      </div>
      <AButton type="primary" @click="navigateTo('/admin/posts')"
        ><EditOutlined aria-hidden="true" />{{ t("posts") }}</AButton
      >
    </div>
    <AAlert v-if="failure" type="error" :title="failure" show-icon />
    <ASkeleton v-else-if="!snapshot" active />
    <template v-if="snapshot">
      <div class="dashboard-metrics">
        <NuxtLink
          v-for="metric in metrics"
          :key="metric.key"
          :to="metric.path"
          class="dashboard-metric"
        >
          <div>
            <span>{{ t(metric.key) }}</span
            ><component :is="metric.icon" aria-hidden="true" />
          </div>
          <strong>{{ metric.value }}</strong>
          <ArrowRightOutlined class="metric-arrow" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div class="dashboard-columns">
        <div class="dashboard-section dashboard-recent">
          <header>
            <div>
              <h2>{{ t("recentPosts") }}</h2>
              <p>{{ t("adminRecentHint") }}</p>
            </div>
            <NuxtLink to="/admin/posts"
              >{{ t("manage") }} <ArrowRightOutlined aria-hidden="true"
            /></NuxtLink>
          </header>
          <div class="dashboard-table-scroll">
            <ATable
              :data-source="recent"
              row-key="id"
              :pagination="false"
              :locale="{ emptyText: t('empty') }"
              :columns="[
                { title: t('title'), dataIndex: 'title', key: 'title' },
                { title: t('status'), key: 'status', width: 150 },
                { title: t('date'), key: 'date', width: 150 },
              ]"
            >
              <template #bodyCell="{ record, column }"
                ><span
                  v-if="column.key === 'title'"
                  class="dashboard-post-title"
                  >{{ record.title }}</span
                ><ATag v-else-if="column.key === 'status'">{{
                  t(record.status)
                }}</ATag
                ><span v-else class="dashboard-date">{{
                  formatDate(record.date)
                }}</span></template
              >
            </ATable>
          </div>
        </div>
        <aside class="dashboard-section dashboard-actions">
          <header>
            <h2>{{ t("adminQuickActions") }}</h2>
          </header>
          <nav :aria-label="t('adminQuickActions')">
            <NuxtLink
              v-for="action in actions"
              :key="action.key"
              :to="action.path"
              ><component :is="action.icon" aria-hidden="true" /><span>{{
                t(action.key)
              }}</span
              ><ArrowRightOutlined aria-hidden="true"
            /></NuxtLink>
          </nav>
          <div class="dashboard-snapshot">
            <span>{{ t("statsUpdated") }}</span
            ><time :datetime="snapshot.updatedAt">{{
              formatDate(snapshot.updatedAt)
            }}</time>
            <p>{{ t("localOnly") }}</p>
          </div>
        </aside>
      </div>
      <div class="dashboard-section dashboard-modules">
        <header>
          <h2>{{ t("adminOrganize") }}</h2>
          <span>{{ t("adminModuleHint") }}</span>
        </header>
        <div class="dashboard-module-grid">
          <NuxtLink
            v-for="domain in modules"
            :key="domain"
            :to="`/admin/${domain}`"
            ><span>{{ t(domain) }}</span
            ><strong>{{ snapshot.collections[domain].length }}</strong
            ><ArrowRightOutlined aria-hidden="true"
          /></NuxtLink>
        </div>
      </div>
    </template>
  </section>
</template>
