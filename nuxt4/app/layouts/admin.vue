<script setup lang="ts">
import { domains } from "#shared/schemas/content";
if (!useRuntimeConfig().public.mockAdmin)
  throw createError({ statusCode: 404 });
const { t, locale } = useCopy();
useHead({ meta: [{ name: "robots", content: "noindex,nofollow" }] });
const locales = [
  "en",
  "zh_CN",
  "zh_TW",
  "ja",
  "es",
  "id",
  "ko",
  "th",
  "tr",
  "vi",
];
</script>
<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <NuxtLink to="/" class="brand">Shirone</NuxtLink>
      <p class="muted">{{ t("manage") }}</p>
      <nav :aria-label="t('navigation')">
        <NuxtLink to="/admin">{{ t("overview") }}</NuxtLink
        ><NuxtLink
          v-for="domain in domains"
          :key="domain"
          :to="`/admin/${domain}`"
          >{{ t(domain) }}</NuxtLink
        ><NuxtLink to="/admin/media">{{ t("media") }}</NuxtLink
        ><NuxtLink to="/admin/tools">{{ t("dataTools") }}</NuxtLink>
      </nav>
    </aside>
    <main class="admin-main">
      <label style="max-width: 180px; margin-bottom: 1rem"
        >{{ t("locale")
        }}<select v-model="locale">
          <option v-for="lang in locales" :key="lang">{{ lang }}</option>
        </select></label
      >
      <p class="notice">{{ t("localNotice") }}</p>
      <slot />
    </main>
  </div>
</template>
