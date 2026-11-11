import { useSyncExternalStore } from "react";

/** Trạng thái lưu của các ô đang ghi lên máy chủ — hiển thị ở đầu trang. */
export type SaveStatus = { saving: number; error: string | null; savedOnce: boolean };

let status: SaveStatus = { saving: 0, error: null, savedOnce: false };
const listeners = new Set<() => void>();

function update(next: SaveStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

export const saveStatus = {
  started: () => update({ ...status, saving: status.saving + 1 }),
  succeeded: () => update({ ...status, saving: status.saving - 1, savedOnce: true }),
  failed: (message: string) => update({ ...status, saving: status.saving - 1, error: message }),
  dismissError: () => update({ ...status, error: null }),
};

export function useSaveStatus(): SaveStatus {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => status,
    () => status,
  );
}
