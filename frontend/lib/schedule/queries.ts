"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
      rememberServerVersions(week);
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

/** Phiên bản gần nhất máy chủ báo cho từng ô; ô không có trong map = máy chủ đang không có ô đó. */
const serverVersions = new Map<string, number>();
/** Số lần ghi chưa xong của từng ô. */
const pendingWrites = new Map<string, number>();
const writeQueues = new Map<string, Promise<void>>();

function rememberServerVersions(week: WeekView) {
  const dates = new Set(week.days);
  for (const key of [...serverVersions.keys()]) {
    if (dates.has(key.split("|")[1]) && !pendingWrites.has(key)) serverVersions.delete(key);
  }
  for (const assignment of week.assignments) {
    const key = cellKey(assignment);
    if (!pendingWrites.has(key)) serverVersions.set(key, assignment.version);
  }
}

function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : "Không lưu được thay đổi.";
}

/** Trả về hàm ghi một ô của tuần: cập nhật màn hình ngay, lưu nền, tự xử lý xung đột. `content` null = xoá ô. */
export function useCellWriter(weekStart: string) {
  const queryClient = useQueryClient();

  return useCallback(
    (ref: CellRef, content: CellContent | null) => {
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
          const version = serverVersions.get(key) ?? null;
          if (content === null) {
            if (version !== null) await api.deleteCell(ref, version);
            serverVersions.delete(key);
          } else {
            const saved = await api.putCell(ref, content, version);
            serverVersions.set(key, saved.version);
            if (isLastPending()) setWeek((week) => withServerCell(week, ref, saved));
          }
          saveStatus.succeeded();
        } catch (error) {
          if (error instanceof ApiError && error.status === 409) {
            // Người khác vừa đổi ô này: hiện lại giá trị của máy chủ.
            const current = error.details as Assignment | null;
            if (current) serverVersions.set(key, current.version);
            else serverVersions.delete(key);
            if (isLastPending()) setWeek((week) => withServerCell(week, ref, current));
          } else {
            void queryClient.invalidateQueries({ queryKey });
          }
          saveStatus.failed(messageOf(error));
        } finally {
          const remaining = (pendingWrites.get(key) ?? 1) - 1;
          if (remaining > 0) pendingWrites.set(key, remaining);
          else pendingWrites.delete(key);
          void queryClient.invalidateQueries({ queryKey: ["export"] });
        }
      };

      writeQueues.set(key, (writeQueues.get(key) ?? Promise.resolve()).then(save));
    },
    [queryClient, weekStart],
  );
}

/** "Áp cho cả tuần": một request cho T2→T6 của một nhân viên, rồi tải lại tuần. */
export function useApplyToWeekdays(weekStart: string) {
  const queryClient = useQueryClient();

  return useCallback(
    async (employeeId: number, content: CellContent, mode: BulkMode) => {
      saveStatus.started();
      try {
        await api.applyToWeekdays(employeeId, weekStart, content, mode);
        saveStatus.succeeded();
      } catch (error) {
        saveStatus.failed(messageOf(error));
        throw error;
      } finally {
        await queryClient.invalidateQueries({ queryKey: weekKey(weekStart) });
        void queryClient.invalidateQueries({ queryKey: ["export"] });
      }
    },
    [queryClient, weekStart],
  );
}
