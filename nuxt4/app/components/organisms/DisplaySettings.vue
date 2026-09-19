<script setup lang="ts">
const { t } = useCopy();
const { hue, style, spec, update } = useTheme();
const { wallpaper, layout, texture, reduced, persist } = useDisplay();
const styles = [
  "tonalSpot",
  "vibrant",
  "content",
  "expressive",
  "rainbow",
  "fruitSalad",
  "monochrome",
  "neutral",
  "fidelity",
] as const;
const textures = [
  "none",
  "starlight",
  "cyber-dots",
  "topography",
  "geometric",
  "sakura",
];
const label = (prefix: string, value: string) =>
  t(prefix + value.replace(/(^|-)(\w)/g, (_, a, b) => b.toUpperCase()));
</script>
<template>
  <section class="display-settings form-stack">
    <label
      >{{ t("themeColor") }} · {{ hue
      }}<input
        v-model.number="hue"
        type="range"
        min="0"
        max="360"
        @input="update"
    /></label>
    <fieldset>
      <legend>{{ t("colorStyle") }}</legend>
      <div class="settings-styles">
        <button
          v-for="value in styles"
          :key="value"
          :aria-pressed="style === value"
          @click="
            style = value;
            update();
          "
        >
          {{ label("style", value) }}
        </button>
      </div>
    </fieldset>
    <label
      >{{ t("colorSpec")
      }}<select v-model="spec" @change="update">
        <option value="2021">{{ t("spec2021") }}</option>
        <option value="2025">{{ t("spec2025") }}</option>
      </select></label
    >
    <label
      >{{ t("wallpaperMode")
      }}<select v-model="wallpaper" @change="persist">
        <option value="banner">{{ t("wallpaperModeBanner") }}</option>
        <option value="none">{{ t("wallpaperModeNone") }}</option>
      </select></label
    >
    <label
      >{{ t("layoutMode")
      }}<select v-model="layout" @change="persist">
        <option value="list">{{ t("layoutList") }}</option>
        <option value="grid">{{ t("layoutGrid") }}</option>
      </select></label
    >
    <label
      >{{ t("texturePreset")
      }}<select v-model="texture" @change="persist">
        <option v-for="value in textures" :key="value" :value="value">
          {{ label("texturePreset", value) }}
        </option>
      </select></label
    >
    <label class="row"
      ><input v-model="reduced" type="checkbox" @change="persist" />{{
        t("reduceMotion")
      }}</label
    >
  </section>
</template>
