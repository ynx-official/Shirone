<script setup lang="ts">
const CollectionView = defineAsyncComponent(
  () => import("~/components/organisms/CollectionView.vue"),
);
const FriendSection = defineAsyncComponent(
  () => import("~/components/organisms/FriendSection.vue"),
);
const ArchiveView = defineAsyncComponent(
  () => import("~/components/organisms/ArchiveView.vue"),
);
import PostCard from "~/components/molecules/PostCard.vue";
const DataTile = defineAsyncComponent(
  () => import("~/components/molecules/DataTile.vue"),
);
const PostView = defineAsyncComponent(
  () => import("~/components/organisms/PostView.vue"),
);
const AlbumView = defineAsyncComponent(
  () => import("~/components/organisms/AlbumView.vue"),
);
const MarkdownBody = defineAsyncComponent(
  () => import("~/components/content/MarkdownBody.vue"),
);
const route = useRoute(),
  repository = usePublicRepository(),
  { t } = useCopy();
const { data: page, error } = await usePublicPage();
if (error.value)
  throw createError({
    statusCode: error.value.statusCode || 500,
    statusMessage: error.value.statusMessage,
  });
if (page.value?.redirect)
  await navigateTo(page.value.redirect, { redirectCode: 301 });
watch(error, (e) => {
  if (e)
    showError({
      statusCode: e.statusCode || 500,
      statusMessage: e.statusMessage,
    });
});
watch(
  () => page.value?.redirect,
  (url) => {
    if (url) navigateTo(url, { redirectCode: 301 });
  },
);
const { data: site } = await useAsyncData("site", repository.site);
useSeoMeta({
  title: () =>
    `${page.value?.kind === "post" ? page.value.title : t(page.value?.title || "home")} · ${site.value?.title}`,
  description: () => page.value?.post?.description || site.value?.subtitle,
});
useHead(() => ({
  link: [
    {
      rel: "canonical",
      href: new URL(route.path, site.value?.url || "https://example.com").href,
    },
  ],
}));
const pageLink = (n: number) => ({
  path: page.value?.kind === "home" ? (n === 1 ? "/" : `/${n}/`) : route.path,
  query: page.value?.kind === "home" ? {} : { ...route.query, page: n },
});
</script>
<template>
  <div v-if="page">
    <PostView v-if="page.post" :post="page.post" /><AlbumView
      v-else-if="
        page.kind === 'albums' &&
        page.items.length === 1 &&
        route.path.split('/').filter(Boolean).length > 1
      "
      :item="page.items[0]!"
    /><ArchiveView
      v-else-if="page.kind === 'archive'"
      :posts="page.posts"
    /><FriendSection
      v-else-if="page.kind === 'friends'"
      :friends="page.items"
    /><CollectionView
      v-else-if="page.kind === 'projects' || page.kind === 'albums'"
      :domain="page.kind"
      :items="page.items"
    /><template v-else
      ><section v-if="page.kind !== 'home'" class="panel">
        <h1>{{ t(page.title) }}</h1>
        <p v-if="page.total" class="muted">{{ page.total }}</p>
        <form
          v-if="
            !['about', 'rss', 'atom', 'tags', 'categories'].includes(
              page.kind,
            ) && route.path.split('/').filter(Boolean).length < 2
          "
          :action="route.path"
          method="get"
          class="row"
        >
          <label
            >{{ t("search")
            }}<input name="q" type="search" :value="route.query.q || ''"
          /></label>
          <label
            v-if="
              ['archive', 'projects', 'skills', 'games', 'devices'].includes(
                page.kind,
              )
            "
            >{{ t("categories")
            }}<input name="category" :value="route.query.category || ''"
          /></label>
          <button type="submit">{{ t("search") }}</button>
        </form>
        <div v-if="['tags', 'categories'].includes(page.kind)" class="row">
          <NuxtLink
            v-for="item in page.items"
            :key="item.id"
            class="chip"
            :to="{
              path: '/archive/',
              query: {
                [page.kind === 'tags' ? 'tag' : 'category']: item.title,
              },
            }"
            >{{ item.title }}</NuxtLink
          >
        </div>
        <a
          v-if="['rss', 'atom'].includes(page.kind)"
          :href="`/${page.kind}.xml`"
          >{{ page.kind.toUpperCase() }} ↗</a
        ><MarkdownBody v-if="page.html" :html="page.html" />
      </section>
      <div
        v-if="page.items.length && !['tags', 'categories'].includes(page.kind)"
        class="grid"
      >
        <template v-for="item in page.items" :key="item.id"
          ><article v-if="page.kind === 'moments'" class="panel">
            <time>{{ item.date.slice(0, 10) }}</time
            ><MarkdownBody :html="item.data.html || ''" />
            <div v-if="item.data.images?.length" class="moment-gallery">
              <a
                v-for="photo in item.data.images"
                :key="photo.src"
                :href="photo.src"
                target="_blank"
                rel="noopener noreferrer"
                ><img
                  :src="photo.thumbnail || photo.src"
                  :srcset="photo.srcset"
                  sizes="(max-width: 600px) 40vw, 240px"
                  :alt="photo.alt || ''"
                  :width="photo.width || 600"
                  :height="photo.height || 400"
                  loading="lazy"
              /></a>
            </div>
          </article>
          <DataTile v-else :item="item" :domain="page.kind"
        /></template>
      </div>
      <div class="post-list">
        <PostCard
          v-for="(post, index) in page.posts"
          :key="post.id"
          :post="post"
          class="onload-entry"
          :style="{ '--entry-index': index }"
        />
      </div>
      <nav
        v-if="page.pages > 1"
        class="row pagination onload-entry"
        :style="{ '--entry-index': page.posts.length }"
        :aria-label="t('navigation')"
      >
        <NuxtLink
          v-if="page.page > 1"
          class="button"
          :to="pageLink(page.page - 1)"
          >{{ t("previous") }}</NuxtLink
        ><span>{{ page.page }} / {{ page.pages }}</span
        ><NuxtLink
          v-if="page.page < page.pages"
          class="button"
          :to="pageLink(page.page + 1)"
          >{{ t("next") }}</NuxtLink
        >
      </nav></template
    >
  </div>
</template>
