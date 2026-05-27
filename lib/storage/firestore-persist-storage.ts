"use client";

import type { StateStorage } from "zustand/middleware";

import {
  clearAttendance,
  loadAttendance,
  saveAttendance,
} from "@/lib/storage/firestore-attendance-repository";
import { useFirestoreSyncStatus } from "@/lib/storage/firestore-sync-status";
import { getApplyingRemote } from "@/lib/storage/remote-sync-flag";
import {
  normalizePersistedPayload,
  toPersistJson,
} from "@/lib/storage/normalize-persisted-payload";
import type { AttendanceStore } from "@/lib/types/attendance";

function parseStoreFromPersistValue(value: string): AttendanceStore | null {
  return normalizePersistedPayload(value);
}

export function createFirestorePersistStorage(
  delayMs = 400,
): StateStorage {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  const flush = (name: string) => {
    const id = timers.get(name);
    if (id === undefined) return;
    clearTimeout(id);
    timers.delete(name);
  };

  return {
    getItem: async (_name) => {
      if (typeof window === "undefined") return null;
      try {
        const store = await loadAttendance();
        return toPersistJson(store);
      } catch {
        return null;
      }
    },
    setItem: (name, value) => {
      if (typeof window === "undefined") return;
      if (getApplyingRemote()) return;

      const store = parseStoreFromPersistValue(value);
      if (!store) return;

      const seq = useFirestoreSyncStatus.getState().beginSaving();
      flush(name);
      timers.set(
        name,
        setTimeout(() => {
          timers.delete(name);
          void saveAttendance(store)
            .then(() => {
              useFirestoreSyncStatus.getState().markSaved(seq);
            })
            .catch((err) => {
              useFirestoreSyncStatus.getState().markError(seq, err);
              console.error("[firestore] save failed:", err);
            });
        }, delayMs),
      );
    },
    removeItem: (name) => {
      if (typeof window === "undefined") return;
      flush(name);
      void clearAttendance().catch((err) => {
        console.error("[firestore] clear failed:", err);
      });
    },
  };
}
