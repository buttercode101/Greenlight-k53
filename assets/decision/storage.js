/** Storage failure must never prevent an in-memory answer or navigation. */
const memory = new Map();
const failed = new Set();
export function storageProblem(area, broken) {
  if (broken) failed.add(area);
  else failed.delete(area);
  if (typeof window !== "undefined")
    window.dispatchEvent(
      new CustomEvent("k53-decision-storage", { detail: failed.size > 0 }),
    );
}
export function storageWarning() {
  return failed.size > 0;
}
export const safeLocalStorage = {
  getItem(key) {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
    } catch {
      storageProblem("progress", true);
      return memory.get(key) ?? null;
    }
  },
  setItem(key, value) {
    if (typeof window === "undefined") return;
    memory.set(key, value);
    try {
      window.localStorage.setItem(key, value);
      storageProblem("progress", false);
    } catch {
      storageProblem("progress", true);
    }
  },
  removeItem(key) {
    memory.delete(key);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
      storageProblem("progress", false);
    } catch {
      storageProblem("progress", true);
    }
  },
};
