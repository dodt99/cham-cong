"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Loader2, LogOut, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types";
import { saveStatus, useSaveStatus } from "@/lib/schedule/save-status";
import { addDays, currentWeekStart, formatWeekRange, isISODate, weekStartOf } from "@/lib/week";

const ROLE_LABELS: Record<CurrentUser["role"], string> = { ADMIN: "Quản trị", EDITOR: "Xếp ca", VIEWER: "Chỉ xem" };

export function WeekHeader({ weekStart, user }: { weekStart: string; user: CurrentUser }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const goTo = (monday: string) => router.push(`/weeks/${monday}`);
  const isCurrentWeek = weekStart === currentWeekStart();

  async function logout() {
    await api.logout().catch(() => undefined);
    queryClient.clear();
    router.replace("/login");
  }

  return (
    <header className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="icon" aria-label="Tuần trước" onClick={() => goTo(addDays(weekStart, -7))}>
          <ChevronLeft className="size-4" />
        </Button>
        <label className="relative">
          <span className="sr-only">Chọn tuần theo ngày</span>
          <span className="flex h-9 items-center rounded-md border border-input px-3 text-sm font-medium shadow-sm">
            {formatWeekRange(weekStart)}
          </span>
          {/* Ô ngày phủ lên nhãn: chọn một ngày bất kỳ để mở tuần chứa ngày đó. */}
          <input
            type="date"
            value={weekStart}
            onChange={(event) => isISODate(event.target.value) && goTo(weekStartOf(event.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <Button type="button" variant="outline" size="icon" aria-label="Tuần sau" onClick={() => goTo(addDays(weekStart, 7))}>
          <ChevronRight className="size-4" />
        </Button>
        {!isCurrentWeek && (
          <Button type="button" variant="ghost" size="sm" onClick={() => goTo(currentWeekStart())}>
            Tuần này
          </Button>
        )}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <SaveIndicator />
        <span className="text-sm text-muted-foreground">
          {user.fullName} · {ROLE_LABELS[user.role]}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={logout}>
          <LogOut className="size-4" />
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}

/** Đang lưu / đã lưu / lỗi lưu gần nhất (bấm để ẩn). */
function SaveIndicator() {
  const status = useSaveStatus();

  if (status.error) {
    return (
      <button type="button" role="alert" onClick={saveStatus.dismissError}
        className="flex max-w-full items-center gap-1.5 rounded-md bg-destructive/10 px-2 py-1 text-left text-sm text-destructive">
        <CircleAlert className="size-4 shrink-0" />
        <span>{status.error}</span>
        <X className="size-3.5 shrink-0 opacity-70" aria-label="Ẩn" />
      </button>
    );
  }
  if (status.saving > 0) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang lưu…
      </span>
    );
  }
  if (status.savedOnce) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <CircleCheck className="size-4 text-emerald-600" />
        Đã lưu
      </span>
    );
  }
  return null;
}
