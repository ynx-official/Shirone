<script setup lang="ts">
const { t } = useCopy();
const location = globalThis.location;
const window = globalThis.window;
const matchMedia = globalThis.matchMedia;
const open = ref(false),
  x = ref(0),
  y = ref(0),
  selection = ref("");
const menu = ref<HTMLElement>();
let origin: HTMLElement | null = null;
function show(e: MouseEvent) {
  if (
    innerWidth < 900 ||
    (e.target as HTMLElement).closest("input,textarea,[contenteditable]")
  )
    return;
  e.preventDefault();
  origin = document.activeElement as HTMLElement;
  selection.value = getSelection()?.toString() || "";
  x.value = Math.min(e.clientX, innerWidth - 230);
  y.value = Math.min(e.clientY, innerHeight - 180);
  open.value = true;
  nextTick(() => menu.value?.querySelector("button")?.focus());
}
function close() {
  open.value = false;
  origin?.focus();
}
function keyboard(e: KeyboardEvent) {
  if (e.key === "Escape") close();
  if (!open.value || !["ArrowDown", "ArrowUp"].includes(e.key)) return;
  e.preventDefault();
  const list = [...menu.value!.querySelectorAll("button")];
  const index = list.indexOf(document.activeElement as HTMLButtonElement);
  list[
    (index + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length
  ]?.focus();
}
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } finally {
    close();
  }
}
onMounted(() => {
  document.addEventListener("contextmenu", show);
  document.addEventListener("keydown", keyboard);
  document.addEventListener("click", close);
});
onBeforeUnmount(() => {
  document.removeEventListener("contextmenu", show);
  document.removeEventListener("keydown", keyboard);
  document.removeEventListener("click", close);
});
</script>
<template>
  <Teleport to="body"
    ><div
      v-if="open"
      ref="menu"
      role="menu"
      class="panel context-actions"
      :style="{ left: `${x}px`, top: `${y}px` }"
      @click.stop
    >
      <button v-if="selection" role="menuitem" @click="copy(selection)">
        {{ t("copySelection") }}</button
      ><button role="menuitem" @click="copy(location.href)">
        {{ t("sharePageLink") }}</button
      ><button
        role="menuitem"
        @click="
          () => {
            window.scrollTo({
              top: 0,
              behavior: matchMedia('(prefers-reduced-motion:reduce)').matches
                ? 'instant'
                : 'smooth',
            });
            close();
          }
        "
      >
        {{ t("backToTop") }}
      </button>
    </div></Teleport
  >
</template>
