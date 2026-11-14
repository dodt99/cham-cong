"use client";

import { useCallback } from "react";
import { type QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api/client";
import type { Assignment, BulkMode, CellContent, CellRef, ExportType, WeekView } from "@/lib/api/types";
import { cellKey, withLocalCell, withServerCell } from "@/lib/schedule/model";
import { saveStatus } from "@/lib/schedule/save-status";

const weekKey = (weekStart: string) => ["week", weekStart] as const;

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: api.me, staleTime: 5 * 60_000 });
}

export function useCatalog() {
  return useQuery({ queryKey: ["catalog"], queryFn: api.catalog, staleTime: 5 * 60_000 });
}

export function useWeek(weekStart: string) {
  return useQuery({
    queryKey: weekKey(weekStart),
    queryFn: async () => {
      const week = await api.week(weekStart);
      rememberServerCells(week);
      return week;
    },
  });
}

export function useExportPreview(type: ExportType, weekStart: string) {
  return useQuery({
    queryKey: ["export", type, weekStart],
    queryFn: () => api.exportPreview(type, weekStart),
  });
}

// ---- lưu từng ô ------------------------------------------------------------------------------------
//
// Mỗi lần ghi gửi kèm phiên bản mà máy chủ báo lần gần nhất cho ô đó; máy chủ từ chối (409) nếu ô đã bị
// người khác đổi. Các lần ghi liên tiếp vào cùng một ô được xếp hàng để lần sau dùng phiên bản của lần trước.
// Lần ghi không thành thì ô trở về giá trị máy chủ đang giữ — màn hình không bao giờ hiện giá trị chưa được lưu.

/** Trạng thái gần nhất máy chủ xác nhận cho từng ô; ô không có trong map = máy chủ đang không có ô đó. */
const serverCells = new Map<string, Assignment>();
/** Số lần ghi chưa xong của từng ô. */
const pendingWrites = new Map<string, number>();
const writeQueues = new Map<string, Promise<void>>();

function rememberServerCells(week: WeekView) {
  const dates = new Set(week.days);
  for (const key of [...serverCells.keys()]) {
    if (dates.has(key.split("|")[1]) && !pendingWrites.has(key)) serverCells.delete(key);
  }
  for (const assignment of week.assignments) {
    const key = cellKey(assignment);
    if (!pendingWrites.has(key)) serverCells.set(key, assignment);
  }
}

function saveErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Không lưu được thay đổi. Ô đã trở về giá trị cũ.";
  if (error.status === 0) return "Chưa lưu được thay đổi vừa rồi vì không kết nối được máy chủ. Ô đã trở về giá trị cũ.";
  return error.message;
}

/**
 * Ghi một ô của tuần: cập nhật màn hình ngay, lưu nền, tự xử lý xung đột. `content` null = xoá ô.
 * Promise trả về hoàn tất khi lần ghi này đã xong (thành công hoặc không).
 */
export function writeCell(
  queryClient: QueryClient,
  weekStart: string,
  ref: CellRef,
  content: CellContent | null,
): Promise<void> {
  const key = cellKey(ref);
  const queryKey = weekKey(weekStart);
  const isLastPending = () => pendingWrites.get(key) === 1;
  const setWeek = (change: (week: WeekView) => WeekView) =>
    queryClient.setQueryData<WeekView>(queryKey, (week) => week && change(week));

  void queryClient.cancelQueries({ queryKey });
  setWeek((week) => withLocalCell(week, ref, content));
  pendingWrites.set(key, (pendingWrites.get(key) ?? 0) + 1);
  saveStatus.started();

  const save = async () => {
    try {
      const version = serverCells.get(key)?.version ?? null;
      if (content === null) {
        if (version !== null) await api.deleteCell(ref, version);
        serverCells.delete(key);
      } else {
        const saved = await api.putCell(ref, content, version);
        serverCells.set(key, saved);
        if (isLastPending()) setWeek((week) => withServerCell(week, ref, saved));
      }
      saveStatus.succeeded();
    } catch (error) {
      // 409: người khác vừa đổi ô này. Máy chủ gửi kèm giá trị hiện tại của ô (null = ô không còn).
      const isConflict = error instanceof ApiError && error.status === 409;
      const current = isConflict ? (error.details as Assignment | null) : null;
      if (current) serverCells.set(key, current);
      else if (isConflict) serverCells.delete(key);
      if (isLastPending()) setWeek((week) => withServerCell(week, ref, serverCells.get(key) ?? null));
      if (!current) void queryClient.invalidateQueries({ queryKey });
      // Mất quyền ghi giữa chừng (admin vừa hạ quyền): nạp lại người dùng để giao diện chuyển sang chỉ xem.
      if (error instanceof ApiError && error.status === 403) void queryClient.invalidateQueries({ queryKey: ["me"] });
      saveStatus.failed(saveErrorMessage(error));
    } finally {
      const remaining = (pendingWrites.get(key) ?? 1) - 1;
      if (remaining > 0) pendingWrites.set(key, remaining);
      else pendingWrites.delete(key);
      void queryClient.invalidateQueries({ queryKey: ["export"] });
    }
  };

  const queued = (writeQueues.get(key) ?? Promise.resolve()).then(save);
  writeQueues.set(key, queued);
  return queued;
}

/** Trả về hàm ghi một ô của tuần (xem {@link writeCell}). */
export function useCellWriter(weekStart: string) {
  const queryClient = useQueryClient();

  return useCallback(
    (ref: CellRef, content: CellContent | null) => {
      void writeCell(queryClient, weekStart, ref, content);
    },
    [queryClient, weekStart],
  );
}

/**
 * "Áp cho cả tuần": một request cho T2→T6 của một nhân viên, rồi tải lại tuần.
 * Lỗi được ném lại cho hộp thoại hiện ngay tại chỗ.
 */
export function useApplyToWeekdays(weekStart: string) {
  const queryClient = useQueryClient();

  return useCallback(
    async (employeeId: number, content: CellContent, mode: BulkMode) => {
      saveStatus.started();
      try {
        await api.applyToWeekdays(employeeId, weekStart, content, mode);
        saveStatus.succeeded();
      } catch (error) {
        saveStatus.aborted();
        throw error;
      } finally {
        await queryClient.invalidateQueries({ queryKey: weekKey(weekStart) });
        void queryClient.invalidateQueries({ queryKey: ["export"] });
      }
    },
    [queryClient, weekStart],
  );
}
