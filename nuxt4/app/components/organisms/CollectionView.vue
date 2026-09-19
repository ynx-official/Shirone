<script setup lang="ts">
import type { Entity } from "#shared/types/content";
import LocalIcon from "~/components/atoms/LocalIcon.vue";
const props = defineProps<{ items: Entity[]; domain: "albums" | "projects" }>();
const { t } = useCopy();
const search = ref(""),
  filter = ref("");
const route = useRoute();
watch(
  () => [props.domain, route.query.tag],
  () => {
    filter.value =
      props.domain === "albums" ? String(route.query.tag || "") : "";
  },
  { immediate: true },
);
const categories = computed(() =>
  [
    ...new Set(
      props.items.flatMap((item) =>
        props.domain === "albums" ? item.tags : [item.category],
      ),
    ),
  ]
    .filter(Boolean)
    .sort(),
);
const items = computed(() =>
  props.items.filter(
    (item) =>
      (!filter.value ||
        (props.domain === "albums"
          ? item.tags.includes(filter.value)
          : item.category === filter.value)) &&
      (!search.value ||
        (item.title + " " + item.description)
          .toLowerCase()
          .includes(search.value.toLowerCase())),
  ),
);
const categoryLabel = (value: string) =>
  String(
    props.items.find((item) => item.category === value)?.data.categoryLabel ||
      value.charAt(0).toUpperCase() + value.slice(1),
  );
</script>
<template>
  <section class="panel collection-panel" :class="domain + '-panel'">
    <h1 class="collection-heading">
      <LocalIcon
        :name="
          domain === 'albums'
            ? 'material-symbols:photo-library-outline-rounded'
            : 'material-symbols:deployed-code-outline'
        "
      />{{ t(domain) }}
    </h1>
    <p class="collection-description">{{ t(domain + "Banner") }}</p>
    <label class="collection-search"
      ><LocalIcon name="search" /><input
        v-model="search"
        type="search"
        :placeholder="t('search')"
        :aria-label="t('search')"
    /></label>
    <div class="collection-filters">
      <button
        v-for="value in categories"
        :key="value"
        :aria-pressed="filter === value"
        @click="filter = filter === value ? '' : value"
      >
        {{ domain === "projects" ? categoryLabel(value) : value }}</button
      ><span>{{ items.length }} {{ t(domain + "Counts") }}</span>
    </div>
    <hr />
    <div v-if="domain === 'albums'" class="album-cards">
      <article v-for="item in items" :key="item.id" class="album-card">
        <NuxtLink class="album-cover" :to="`/albums/${item.id}/`"
          ><img
            v-if="item.image"
            :src="item.image"
            :alt="item.title"
            width="480"
            height="360"
            loading="lazy" /><span v-if="item.data.protected" class="album-lock"
            ><LocalIcon name="lock" /></span
        ></NuxtLink>
        <div class="album-card-body">
          <h2>
            <NuxtLink :to="`/albums/${item.id}/`"
              >{{ item.title }}<LocalIcon name="arrow"
            /></NuxtLink>
          </h2>
          <p>{{ item.description }}</p>
          <div class="album-meta">
            {{ item.date }}　·　{{ item.data.location }}
          </div>
          <div class="album-tags">
            <NuxtLink
              v-for="tag in item.tags"
              :key="tag"
              :to="{ path: '/albums/', query: { tag } }"
              @click.prevent="filter = tag"
              >#{{ tag }}</NuxtLink
            >
          </div>
        </div>
      </article>
    </div>
    <div v-else class="project-cards">
      <article
        v-for="item in items"
        :key="item.id"
        class="project-card"
        :class="{ featured: item.data.featured }"
      >
        <div v-if="item.image" class="project-cover">
          <img
            :src="item.image"
            :alt="item.data.coverAlt || item.title"
            width="720"
            height="405"
            loading="lazy"
          /><span v-if="item.data.featured" class="project-pin"
            >★ {{ t("pinned") }}</span
          >
        </div>
        <div class="project-card-body">
          <div class="project-name">
            <span v-if="!item.image" class="project-icon"
              ><LocalIcon :name="item.data.icon"
            /></span>
            <div>
              <h2>{{ item.title }}</h2>
              <span class="project-phase"
                ><LocalIcon
                  :name="
                    item.data.phase === 'shipped'
                      ? 'material-symbols:check-circle-outline-rounded'
                      : 'material-symbols:construction-rounded'
                  "
                />{{ t("projectPhase" + categoryLabel(item.data.phase)) }}</span
              >
            </div>
            <span v-if="item.data.year" class="project-year">{{
              item.data.year
            }}</span>
          </div>
          <p>{{ item.description }}</p>
          <div class="project-footer">
            <div class="project-technologies">
              <span v-for="tech in item.data.technologies" :key="tech">{{
                tech
              }}</span>
            </div>
            <a
              v-if="item.data.repository"
              :href="item.data.repository"
              rel="noopener noreferrer"
              class="project-source"
              ><LocalIcon name="fa6-brands:github" />{{ t("projectSource") }}</a
            >
          </div>
        </div>
      </article>
    </div>
    <p v-if="!items.length">{{ t(domain + "NoResults") }}</p>
  </section>
</template>
