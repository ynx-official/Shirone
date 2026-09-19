<script setup lang="ts">
import LocalIcon from "~/components/atoms/LocalIcon.vue";
import SegmentedControl from "~/components/atoms/SegmentedControl.vue";
import { MC_STYLES, resolveScheme } from "~/utils/mc-utils";
import type { Site } from "#shared/types/content";
const { t } = useCopy();
const { data: site } = useNuxtData<Site>("site");
const { hue, style, spec, dark, update } = useTheme();
const { wallpaper, layout, texture, reduced, persist } = useDisplay();
const enabled = computed(() => site.value?.displaySettings);
const defaults = computed(() => site.value!.themeColor);
const textures = [
  ["none", "block-rounded"],
  ["starlight", "auto-awesome-outline-rounded"],
  ["cyber-dots", "grid-view-rounded"],
  ["topography", "waves-rounded"],
  ["geometric", "category-outline-rounded"],
  ["sakura", "local-florist-outline-rounded"],
];
const label = (prefix: string, value: string) =>
  t(prefix + value.replace(/(^|-)(\w)/g, (_, a, b) => b.toUpperCase()));
const previews = computed(() =>
  MC_STYLES.map((value) => ({
    value,
    colors: resolveScheme(hue.value, dark.value, value, spec.value),
  })),
);
const currentColor = computed(
  () =>
    previews.value.find((p) => p.value === style.value)?.colors.primary ||
    "var(--primary)",
);
const dirty = computed(
  () =>
    hue.value !== defaults.value.hue ||
    style.value !== defaults.value.style ||
    spec.value !== defaults.value.spec ||
    wallpaper.value !== site.value?.wallpaperMode ||
    layout.value !== site.value?.layout.mode ||
    texture.value !== site.value?.texture.defaultPreset,
);
function reset() {
  hue.value = defaults.value.hue;
  style.value = defaults.value.style;
  spec.value = defaults.value.spec;
  wallpaper.value = site.value!.wallpaperMode;
  layout.value = site.value!.layout.mode;
  texture.value = site.value!.texture.defaultPreset;
  void update();
  persist();
}
</script>
<template>
  <section class="display-settings" :aria-label="t('themeColor')">
    <div class="settings-stack">
      <div class="settings-section">
        <div class="settings-heading">
          <h2><span class="title-accent" />{{ t("themeColor") }}</h2>
          <button
            class="settings-reset"
            :class="{ 'is-clean': !dirty }"
            :disabled="!dirty"
            :aria-label="t('reset')"
            @click="reset"
          >
            <LocalIcon name="fa6-solid:arrow-rotate-left" /></button
          ><output>{{ hue }}</output
          ><span
            class="settings-current-color"
            :style="{ background: currentColor }"
            aria-hidden="true"
          />
        </div>
        <div class="settings-hue">
          <input
            v-model.number="hue"
            type="range"
            min="0"
            max="360"
            step="5"
            :aria-label="t('themeColor')"
            @input="update"
          />
        </div>
        <div v-if="enabled?.colorStyle" class="settings-field">
          <h3>{{ t("colorStyle") }}</h3>
          <div
            class="settings-swatches"
            role="radiogroup"
            :aria-label="t('colorStyle')"
          >
            <label
              v-for="preview in previews"
              :key="preview.value"
              class="settings-choice"
              :class="{ selected: style === preview.value }"
              ><input
                v-model="style"
                type="radio"
                name="palette-style"
                :value="preview.value"
                @change="update"
              /><span class="settings-dots" aria-hidden="true"
                ><span
                  v-for="role in ['primary', 'secondary', 'tertiary']"
                  :key="role"
                  :style="{
                    background: preview.colors[role] || 'var(--primary)',
                  }" /></span
              ><span>{{ label("style", preview.value) }}</span></label
            >
          </div>
        </div>
        <div v-if="enabled?.colorSpec" class="settings-field">
          <h3>{{ t("colorSpec") }}</h3>
          <SegmentedControl
            v-model="spec"
            :label="t('colorSpec')"
            :options="[
              { value: '2021', label: t('spec2021') },
              { value: '2025', label: t('spec2025') },
            ]"
            @update:model-value="update"
          />
        </div>
      </div>
      <div
        v-if="enabled?.wallpaperMode || enabled?.layoutMode || enabled?.texture"
        class="settings-section"
      >
        <div v-if="enabled?.wallpaperMode" class="settings-field">
          <h3>{{ t("wallpaperMode") }}</h3>
          <SegmentedControl
            v-model="wallpaper"
            :label="t('wallpaperMode')"
            :options="[
              { value: 'none', label: t('wallpaperModeNone') },
              { value: 'banner', label: t('wallpaperModeBanner') },
            ]"
            @update:model-value="persist"
          />
        </div>
        <div v-if="enabled?.layoutMode" class="settings-field">
          <h3>{{ t("layoutMode") }}</h3>
          <SegmentedControl
            v-model="layout"
            :label="t('layoutMode')"
            :options="[
              { value: 'list', label: t('layoutList') },
              { value: 'grid', label: t('layoutGrid') },
            ]"
            @update:model-value="persist"
          />
        </div>
        <div v-if="enabled?.texture" class="settings-field">
          <h3>{{ t("texturePreset") }}</h3>
          <div
            class="settings-swatches"
            role="radiogroup"
            :aria-label="t('texturePreset')"
          >
            <label
              v-for="[value, icon] in textures"
              :key="value"
              class="settings-choice"
              :class="{ selected: texture === value }"
              ><input
                v-model="texture"
                type="radio"
                name="texture-preset"
                :value="value"
                @change="persist"
              /><LocalIcon :name="'material-symbols:' + icon" /><span>{{
                label("texturePreset", value!)
              }}</span></label
            >
          </div>
        </div>
      </div>
      <div
        v-if="enabled?.reduceMotion"
        class="settings-section settings-motion"
      >
        <span
          ><LocalIcon name="material-symbols:motion-photos-off" />{{
            t("reduceMotion")
          }}</span
        ><label class="settings-switch"
          ><input
            v-model="reduced"
            type="checkbox"
            role="switch"
            :aria-label="t('reduceMotion')"
            @change="persist" /><span aria-hidden="true"
            ><LocalIcon
              :name="
                reduced ? 'material-symbols:check-rounded' : 'close'
              " /></span
        ></label>
      </div>
    </div>
  </section>
</template>
