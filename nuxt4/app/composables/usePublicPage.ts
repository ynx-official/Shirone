export function usePublicPage() {
  const route = useRoute();
  const repository = usePublicRepository();
  const isFriends = computed(
    () => route.path.replace(/\/$/, "") === "/friends",
  );
  const key = computed(
    () => `page:${isFriends.value ? route.path : route.fullPath}`,
  );
  // The persistent layout and page share one handler and complete friend list.
  return useAsyncData(key, () =>
    repository.page(route.path, isFriends.value ? {} : route.query),
  );
}
