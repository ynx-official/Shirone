import type { Site, PageData } from "#shared/types/content";
export interface PublicRepository {
  site: () => Promise<Site>;
  page: (path: string, query?: Record<string, unknown>) => Promise<PageData>;
}
export function createPublicRepository(
  request: typeof $fetch,
): PublicRepository {
  return {
    site: () => request<Site>("/api/mock/site"),
    page: (path, query = {}) =>
      request<PageData>("/api/mock/page", { query: { ...query, path } }),
  };
}
