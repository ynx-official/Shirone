export interface MediaRecord {
  id: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
}
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("shirone-media-v1", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("media", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("media", mode);
    const request = action(tx.objectStore("media"));
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onabort = tx.onerror = () => {
      db.close();
      reject(tx.error || request.error);
    };
  });
}
export const mediaRepository = {
  list: () =>
    transaction("readonly", (s) => s.getAll()) as Promise<MediaRecord[]>,
  async add(file: File) {
    if (
      ![
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/gif",
        "image/avif",
      ].includes(file.type) ||
      file.size > 20 * 1024 * 1024
    )
      throw Error("Unsupported image or size above 20 MB");
    const item: MediaRecord = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      blob: file,
    };
    await transaction("readwrite", (s) => s.put(item));
    return item;
  },
  async remove(id: string) {
    await transaction("readwrite", (s) => s.delete(id));
  },
  async clear() {
    await transaction("readwrite", (s) => s.clear());
  },
};
