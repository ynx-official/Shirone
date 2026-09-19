import { createAdminRepository } from "~/repositories/admin";
import type { Snapshot } from "#shared/schemas/content";
export function useAdmin() {
  const snapshot = useState<Snapshot | null>("admin-snapshot", () => null),
    failure = useState("admin-error", () => ""),
    ready = useState("admin-ready", () => false);
  const { t } = useCopy();
  const repository = () =>
    createAdminRepository(localStorage, () =>
      $fetch<Snapshot>("/api/mock/admin"),
    );
  async function load() {
    if (ready.value) return;
    try {
      snapshot.value = await repository().load();
      ready.value = true;
      failure.value = "";
    } catch {
      failure.value = t("invalidData");
    }
  }
  async function save(next: Snapshot) {
    try {
      const saved = await repository().save(next);
      snapshot.value = saved;
      failure.value = "";
      return true;
    } catch {
      failure.value = t("saveError");
      return false;
    }
  }
  async function reset() {
    try {
      snapshot.value = await repository().reset();
      ready.value = true;
      failure.value = "";
    } catch {
      failure.value = t("saveError");
    }
  }
  onMounted(load);
  return { snapshot, failure, ready, save, reset, load };
}
