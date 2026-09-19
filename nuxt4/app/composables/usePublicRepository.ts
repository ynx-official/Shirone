import { createPublicRepository } from "~/repositories/public";
export const usePublicRepository = () =>
  createPublicRepository(useRequestFetch() as typeof $fetch);
