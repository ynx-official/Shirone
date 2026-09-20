export function usePublicPage() {
  const route = useRoute();
  const repository = usePublicRepository();
  const localFilters = computed(() =>
    ["/friends", "/moments", "/anime", "/compass"].includes(
      route.path.replace(/\/$/, ""),
    ),
  );
  const key = computed(
    () => `page:${localFilters.value ? route.path : route.fullPath}`,
  );
  // Local filters retain the complete collection, including all tag options.
  return useAsyncData(key, () =>
    repository.page(route.path, localFilters.value ? {} : route.query),
  );
}
