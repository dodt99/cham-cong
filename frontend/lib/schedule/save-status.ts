import { useSyncExternalStore } from "react";

/** Trạng thái lưu của các ô đang ghi lên máy chủ — hiện ở đầu trang và ở thông báo nổi cuối màn hình. */
export type SaveStatus = {
  saving: number;
  /** Lỗi lưu gần nhất, giữ cho tới khi người dùng ẩn đi. */
  error: string | null;
  savedOnce: boolean;
  /** Vừa lưu xong trong vài giây gần đây — để báo "Đã lưu" thoáng qua. */
  justSaved: boolean;
};

const JUST_SAVED_MS = 2500;

let status: SaveStatus = { saving: 0, error: null, savedOnce: false, justSaved: false };
let justSavedTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function update(next: SaveStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

export const saveStatus = {
  started: () => update({ ...status, saving: status.saving + 1 }),
  succeeded: () => {
    update({ ...status, saving: status.saving - 1, savedOnce: true, justSaved: true });
    clearTimeout(justSavedTimer);
    justSavedTimer = setTimeout(() => update({ ...status, justSaved: false }), JUST_SAVED_MS);
  },
  failed: (message: string) => update({ ...status, saving: status.saving - 1, error: message, justSaved: false }),
  /** Lần lưu kết thúc không thành mà nơi gọi tự hiện lỗi (ví dụ trong hộp thoại). */
  aborted: () => update({ ...status, saving: status.saving - 1 }),
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
