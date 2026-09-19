<script setup lang="ts">
const hydrated = ref(false);
onMounted(() => {
  hydrated.value = true;
});
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import ArticleShare from "~/components/organisms/ArticleShare.vue";
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
    <div v-if="!post.protected || unlocked" class="article-reading">
      <span
        ><span class="meta-icon"><LocalIcon name="words" /></span
        >{{ post.words }} {{ t("wordsCount") }}</span
      ><span
        ><span class="meta-icon"><LocalIcon name="time" /></span
        >{{ post.minutes }} {{ t("minutesCount") }}</span
      >
    </div>
    <h1 class="article-heading">
      <span class="title-accent" />{{ post.title }}
    </h1>
    <div class="post-meta">
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
    <hr class="article-divider" />
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
        :html="content.html || ''"
        :styles="content.styles"
        :syntaxes="content.syntaxes"
    /></template>
  </article>
  <component :is="showcase" v-if="post.id === 'mdx-showcase'" />
  <ArticleShare :title="post.title" :description="post.description" />
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
