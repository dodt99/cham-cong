"use client";

import { CircleAlert, CircleCheck, Loader2, RefreshCw, WifiOff, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveStatus, useSaveStatus } from "@/lib/schedule/save-status";

type StatusToastsProps = {
  /** Lần tải lại dữ liệu gần nhất bị lỗi (màn hình đang hiện bản đã tải trước đó); null = bình thường. */
  staleMessage: string | null;
  retrying: boolean;
  onRetry: () => void;
};

/**
 * Thông báo nổi ở cuối màn hình, luôn nhìn thấy dù đang cuộn tới đâu:
 * lỗi lưu (giữ tới khi bấm ẩn), cảnh báo mất kết nối, và trạng thái lưu trên điện thoại
 * (trên máy tính trạng thái lưu nằm cố định ở đầu trang).
 */
export function StatusToasts({ staleMessage, retrying, onRetry }: StatusToastsProps) {
  const status = useSaveStatus();
  const toast = "pointer-events-auto flex max-w-full items-start gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-lg";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
      {staleMessage && (
        <div role="status" className={`${toast} border-amber-300 text-amber-900 dark:border-amber-700 dark:text-amber-200`}>
          <WifiOff className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0">{staleMessage} Đang hiện dữ liệu đã tải trước đó.</span>
          <Button type="button" variant="outline" size="sm" className="-my-0.5 h-7 shrink-0" disabled={retrying} onClick={onRetry}>
            <RefreshCw className={retrying ? "size-3.5 animate-spin" : "size-3.5"} />
            Thử lại
          </Button>
        </div>
      )}
      {status.error ? (
        <div role="alert" className={`${toast} border-destructive/40 text-destructive`}>
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0">{status.error}</span>
          <button type="button" aria-label="Ẩn thông báo" onClick={saveStatus.dismissError}
            className="-mr-1 shrink-0 rounded p-0.5 opacity-70 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      ) : status.saving > 0 ? (
        <div className={`${toast} items-center text-muted-foreground md:hidden`}>
          <Loader2 className="size-4 animate-spin" />
          Đang lưu…
        </div>
      ) : status.justSaved ? (
        <div className={`${toast} items-center text-muted-foreground md:hidden`}>
          <CircleCheck className="size-4 text-emerald-600" />
          Đã lưu
        </div>
      ) : null}
    </div>
  );
}
