import {
  snapshotSchema,
  type Snapshot,
  type Domain,
  type Entity,
} from "#shared/schemas/content";
export const STORAGE_KEY = "shirone:admin:v1";
export function validateSnapshot(input: unknown): Snapshot {
  return snapshotSchema.parse(input);
}
export function references(
  snapshot: Snapshot,
  domain: Domain,
  item: Entity,
): string[] {
  if (domain === "categories")
    return snapshot.collections.posts
      .filter((p) => p.category === item.title)
      .map((p) => p.title);
  if (domain === "tags")
    return snapshot.collections.posts
      .filter((p) => p.tags.includes(item.title))
      .map((p) => p.title);
  if (domain === "series")
    return snapshot.collections.posts
      .filter((p) => p.series === item.id)
      .map((p) => p.title);
  return [];
}
export function createAdminRepository(
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">,
  seed: () => Promise<Snapshot>,
) {
  return {
    async load() {
      const raw = storage.getItem(STORAGE_KEY);
      return raw
        ? validateSnapshot(JSON.parse(raw))
        : validateSnapshot(await seed());
    },
    async save(input: Snapshot) {
      const snapshot = validateSnapshot({
        ...input,
        updatedAt: new Date().toISOString(),
      });
      storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      return snapshot;
    },
    async reset() {
      const initial = validateSnapshot(await seed());
      storage.removeItem(STORAGE_KEY);
      return initial;
    },
  };
}
