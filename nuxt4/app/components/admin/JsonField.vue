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
    ><input
      type="checkbox"
      :checked="modelValue"
      @change="
        emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
    />{{ label }}</label
  ><label v-else-if="typeof modelValue === 'number'"
    >{{ label
    }}<input
      type="number"
      :value="modelValue"
      @input="
        emit(
          'update:modelValue',
          Number(($event.target as HTMLInputElement).value),
        )
      " /></label
  ><label v-else-if="typeof modelValue === 'string' || modelValue === null"
    >{{ label
    }}<textarea
      v-if="String(modelValue || '').length > 120"
      :value="modelValue || ''"
      @input="
        emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
      " /><input
      v-else
      :value="modelValue || ''"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
  /></label>
  <details v-else class="nested-field" :open="depth < 1">
    <summary>{{ label }}</summary>
    <div>
      <template v-if="Array.isArray(modelValue)"
        ><div v-for="(value, i) in modelValue" :key="i">
          <JsonField
            :model-value="value"
            :label="`${label} ${i + 1}`"
            :depth="depth + 1"
            @update:model-value="child(i, $event)"
          /><button type="button" @click="remove(i)">{{ t("remove") }}</button
          ><button
            v-if="i > 0"
            type="button"
            @click="
              () => {
                const next = [...modelValue];
                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                emit('update:modelValue', next);
              }
            "
          >
            ↑
          </button>
        </div>
        <button type="button" @click="add">{{ t("add") }}</button></template
      ><template v-else
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
