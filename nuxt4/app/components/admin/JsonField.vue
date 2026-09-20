<script setup lang="ts">
const props = defineProps<{ modelValue: any; label: string; depth?: number }>();
const emit = defineEmits<{ "update:modelValue": [value: any] }>();
const { t } = useCopy();
const depth = computed(() => props.depth || 0);
function child(key: string | number, value: any) {
  const next = Array.isArray(props.modelValue)
    ? [...props.modelValue]
    : { ...props.modelValue };
  next[key] = value;
  emit("update:modelValue", next);
}
function remove(index: number) {
  emit(
    "update:modelValue",
    props.modelValue.filter((_: any, i: number) => i !== index),
  );
}
function add() {
  const templates: Record<string, any> = {
    photos: { src: "", alt: "", title: "", width: 800, height: 600 },
    entries: { label: "", href: "", note: "" },
    links: { name: "", url: "", icon: "" },
  };
  const first = props.modelValue[0] ?? templates[props.label];
  emit("update:modelValue", [
    ...props.modelValue,
    first === undefined
      ? ""
      : typeof first === "object"
        ? JSON.parse(JSON.stringify(first))
        : typeof first === "number"
          ? 0
          : typeof first === "boolean"
            ? false
            : "",
  ]);
}
</script>
<template>
  <label v-if="typeof modelValue === 'boolean'" class="row"
    ><ACheckbox
      :checked="modelValue"
      @update:checked="emit('update:modelValue', $event)"
      >{{ label }}</ACheckbox
    ></label
  >
  <label v-else-if="typeof modelValue === 'number'"
    >{{ label
    }}<AInputNumber
      :value="modelValue"
      @update:value="emit('update:modelValue', $event ?? 0)"
  /></label>
  <label v-else-if="typeof modelValue === 'string' || modelValue === null"
    >{{ label
    }}<ATextarea
      v-if="String(modelValue || '').length > 120"
      :value="modelValue || ''"
      @update:value="emit('update:modelValue', $event)" /><AInput
      v-else
      :value="modelValue || ''"
      @update:value="emit('update:modelValue', $event)"
  /></label>
  <details v-else class="nested-field" :open="depth < 1">
    <summary>{{ label }}</summary>
    <div>
      <template v-if="Array.isArray(modelValue)">
        <div v-for="(value, i) in modelValue" :key="i">
          <JsonField
            :model-value="value"
            :label="`${label} ${i + 1}`"
            :depth="depth + 1"
            @update:model-value="child(i, $event)"
          />
          <AButton danger size="small" @click="remove(i)">{{
            t("remove")
          }}</AButton>
          <AButton
            v-if="i > 0"
            size="small"
            :aria-label="t('previous')"
            @click="
              () => {
                const next = [...modelValue];
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                emit('update:modelValue', next);
              }
            "
            >↑</AButton
          >
        </div>
        <AButton @click="add">{{ t("add") }}</AButton>
      </template>
      <template v-else
        ><JsonField
          v-for="(value, key) in modelValue"
          :key="key"
          :model-value="value"
          :label="String(key)"
          :depth="depth + 1"
          @update:model-value="child(key, $event)"
      /></template>
    </div>
  </details>
</template>
