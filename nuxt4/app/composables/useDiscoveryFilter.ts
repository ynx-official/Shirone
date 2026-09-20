export function useDiscoveryFilter(parameter: "status" | "group") {
  const route = useRoute(),
    router = useRouter();
  const query = ref(String(route.query.q || "")),
    selected = ref(String(route.query[parameter] || ""));
  const phase = ref<"idle" | "loading" | "out">("idle"),
    hydrated = ref(false);
  let timers: ReturnType<typeof setTimeout>[] = [];
  onMounted(() => {
    hydrated.value = true;
  });
  onBeforeUnmount(() => timers.forEach(clearTimeout));
  watch(
    () => [route.query.q, route.query[parameter]],
    () => {
      query.value = String(route.query.q || "");
      selected.value = String(route.query[parameter] || "");
    },
  );
  const reduced = () =>
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("motion-reduced");
  function sync() {
    void router.replace({
      path: route.path,
      hash: route.hash,
      query: {
        ...route.query,
        q: query.value || undefined,
        [parameter]: selected.value || undefined,
      },
    });
  }
  function select(value: string) {
    selected.value = selected.value === value ? "" : value;
    sync();
    timers.forEach(clearTimeout);
    if (reduced()) {
      phase.value = "idle";
      return;
    }
    phase.value = "loading";
    timers = [
      setTimeout(() => (phase.value = "out"), 300),
      setTimeout(() => (phase.value = "idle"), 450),
    ];
  }
  return { query, selected, phase, hydrated, reduced, sync, select };
}
