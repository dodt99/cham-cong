import type { StateStorage } from "zustand/middleware";

export function createDebouncedLocalStorage(
  delayMs = 100,
): StateStorage {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const flush = (name: string) => {
    const id = timers.get(name);
    if (id === undefined) return;
    clearTimeout(id);
    timers.delete(name);
  };

  return {
    getItem: (name) => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(name);
    },
    setItem: (name, value) => {
      if (typeof window === "undefined") return;
      flush(name);
      timers.set(
        name,
        setTimeout(() => {
          timers.delete(name);
          localStorage.setItem(name, value);
        }, delayMs),
      );
    },
    removeItem: (name) => {
      if (typeof window === "undefined") return;
      flush(name);
      localStorage.removeItem(name);
    },
  };
}
