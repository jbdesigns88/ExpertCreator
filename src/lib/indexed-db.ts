const DB_NAME = "expertmaker-sql";
const STORE_NAME = "files";
const KEY = "primary";

export async function saveToIndexedDb(data: Uint8Array) {
  const db = await openDatabase();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    const store = tx.objectStore(STORE_NAME);
    store.put(data, KEY);
  });
}

export async function loadFromIndexedDb() {
  const db = await openDatabase();
  return new Promise<ArrayBuffer | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(KEY);
    request.onsuccess = () => {
      const result = request.result as ArrayBuffer | Uint8Array | undefined;
      if (!result) {
        resolve(null);
        return;
      }
      if (result instanceof ArrayBuffer) {
        resolve(result);
        return;
      }
      resolve(result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength));
    };
    request.onerror = () => reject(request.error);
  });
}

async function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
