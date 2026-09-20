<script setup lang="ts">
const hydrated = ref(false);
onMounted(() => {
  hydrated.value = true;
});
import LocalIcon from "~/components/atoms/LocalIcon.vue";
const ArticleShare = defineAsyncComponent(
  () => import("~/components/organisms/ArticleShare.vue"),
);
import type { Post } from "#shared/types/content";
import MarkdownBody from "~/components/content/MarkdownBody.vue";
import { decrypt } from "~/utils/decrypt";
const showcase = defineAsyncComponent(
  () => import("~/components/content/VueShowcase.vue"),
);
const repository = usePublicRepository();
const { data: site } = await useAsyncData("site", repository.site);
const comments = site.value?.comments
  ? defineAsyncComponent(() => import("~/components/organisms/Comments.vue"))
  : undefined;
const props = defineProps<{ post: Post }>();
const { t } = useCopy();
const password = ref(""),
  error = ref(false),
  busy = ref(false);
const unlocked = ref<Pick<Post, "html" | "styles" | "syntaxes" | "toc">>();
watch(
  () => props.post.id,
  () => {
    unlocked.value = undefined;
    password.value = "";
    error.value = false;
  },
);
const content = computed(() => unlocked.value || props.post);
const lastUpdated = computed(() =>
  (props.post.updated || props.post.published).slice(0, 10),
);
const updateAge = computed(() =>
  Math.max(
    0,
    Math.floor(
      (Date.parse(site.value?.today || lastUpdated.value) -
        Date.parse(lastUpdated.value)) /
        86400000,
    ),
  ),
);
const copyMessage = ref("");
async function copyLink() {
  try {
    await navigator.clipboard.writeText(
      new URL(props.post.url, location.origin).href,
    );
    copyMessage.value = t("copySuccess");
  } catch {
    copyMessage.value = t("copyFailed");
  }
}
watch(
  () => props.post.id,
  () => {
    copyMessage.value = "";
  },
);
async function unlock() {
  if (!props.post.cipher) return;
  busy.value = true;
  error.value = false;
  try {
    unlocked.value = await decrypt(props.post.cipher, password.value);
    password.value = "";
  } catch {
    error.value = true;
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <article class="panel article-panel">
    <div
      v-if="!post.protected || unlocked"
      class="article-reading onload-entry"
    >
      <span
        ><span class="meta-icon"><LocalIcon name="words" /></span
        >{{ post.words }} {{ t("wordsCount") }}</span
      ><span
        ><span class="meta-icon"><LocalIcon name="time" /></span
        >{{ post.minutes }} {{ t("minutesCount") }}</span
      >
    </div>
    <div class="article-title-row">
      <h1 class="article-heading onload-entry">
        <span class="title-accent" aria-hidden="true" /><span>{{
          post.title
        }}</span>
      </h1>
      <button
        class="article-copy-link"
        type="button"
        :disabled="!hydrated"
        :aria-label="t('copyLink')"
        :title="t('copyLink')"
        @click="copyLink"
      >
        <LocalIcon name="link" />
      </button>
      <span class="sr-only" role="status">{{ copyMessage }}</span>
    </div>
    <div class="post-meta onload-entry">
      <span
        ><span class="meta-icon"><LocalIcon name="date" /></span
        ><time :datetime="post.published">{{
          post.published.slice(0, 10)
        }}</time></span
      ><NuxtLink :to="{ path: '/archive/', query: { category: post.category } }"
        ><span class="meta-icon"><LocalIcon name="category" /></span
        >{{ post.category || t("uncategorized") }}</NuxtLink
      ><span v-if="post.tags.length"
        ><span class="meta-icon"><LocalIcon name="tag" /></span
        ><template v-for="(tag, i) in post.tags" :key="tag"
          ><span v-if="i">/</span
          ><NuxtLink :to="{ path: '/archive/', query: { tag } }">{{
            tag
          }}</NuxtLink></template
        ></span
      >
    </div>
    <img
      v-if="post.image"
      class="article-cover onload-entry"
      :src="post.image"
      :srcset="post.imageSrcset"
      sizes="(min-width: 1280px) 729px, (min-width: 768px) 70vw, 90vw"
      :alt="post.title"
      loading="eager"
      decoding="async"
    />
    <hr v-else class="article-divider" />
    <form
      v-if="post.protected && !unlocked"
      class="form-stack"
      @submit.prevent="unlock"
    >
      <label
        >{{ t("password")
        }}<input
          v-model="password"
          type="password"
          :disabled="!hydrated"
          autocomplete="off"
          required
      /></label>
      <p>{{ post.passwordHint }}</p>
      <button :disabled="busy || !hydrated">{{ t("unlock") }}</button>
      <p v-if="error" role="alert">{{ t("unlockError") }}</p>
    </form>
    <template v-else>
      <MarkdownBody
        class="onload-entry article-body-entry"
        :html="content.html || ''"
        :styles="content.styles"
        :syntaxes="content.syntaxes"
      />
      <component :is="showcase" v-if="post.id === 'mdx-showcase'" />
    </template>
    <footer
      v-if="site?.license?.enable || site?.article?.share.enable"
      class="article-footer"
    >
      <section
        v-if="site?.license?.enable"
        class="article-license"
        :aria-label="t('license')"
      >
        <p class="article-license-title">{{ post.title }}</p>
        <dl>
          <div>
            <dt>{{ t("author") }}</dt>
            <dd>{{ site.profileName }}</dd>
          </div>
          <div>
            <dt>{{ t("publishedAt") }}</dt>
            <dd>
              <time :datetime="post.published">{{
                post.published.slice(0, 10)
              }}</time>
            </dd>
          </div>
          <div>
            <dt>{{ t("license") }}</dt>
            <dd>
              <a
                :href="site.license.url"
                target="_blank"
                rel="noopener noreferrer"
                >{{ site.license.name }}</a
              >
            </dd>
          </div>
        </dl>
      </section>
      <ArticleShare
        v-if="site?.article?.share.enable"
        :key="post.id"
        :title="post.title"
        :description="post.description"
      />
    </footer>
  </article>
  <aside
    v-if="
      site?.article?.lastUpdated.enable &&
      updateAge >= site.article.lastUpdated.minimumAgeDays
    "
    class="panel article-update"
  >
    <LocalIcon name="time" />
    <div>
      <p>
        {{
          t("lastUpdatedNotice")
            .replace("{date}", lastUpdated)
            .replace("{days}", String(updateAge))
        }}
      </p>
      <small>{{ t("lastUpdatedWarning") }}</small>
    </div>
  </aside>
  <component
    :is="comments"
    v-if="
      comments &&
      site?.comments &&
      post.comment !== false &&
      (!post.protected || unlocked)
    "
    :key="post.id"
    :config="site.comments"
  />
</template>
