"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleAlert, CircleCheck, Loader2, LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/lib/api/client";
import type { CurrentUser } from "@/lib/api/types";
import { useSaveStatus } from "@/lib/schedule/save-status";
import { cn } from "@/lib/utils";
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
        <WeekPicker weekStart={weekStart} onSelect={goTo} />
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
        {user.role === "ADMIN" && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <Settings className="size-4" />
              Quản trị
            </Link>
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={logout}>
          <LogOut className="size-4" />
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}

/** Số tuần liệt kê trước và sau tuần đang xem. */
const NEARBY_WEEKS = 4;

/** Nút hiện tuần đang xem; bấm để chọn một tuần lân cận hoặc nhập một ngày bất kỳ. */
function WeekPicker({ weekStart, onSelect }: { weekStart: string; onSelect: (monday: string) => void }) {
  const [open, setOpen] = useState(false);
  const thisWeek = currentWeekStart();
  const weeks = Array.from({ length: 2 * NEARBY_WEEKS + 1 }, (_, index) => addDays(weekStart, (index - NEARBY_WEEKS) * 7));

  const select = (monday: string) => {
    setOpen(false);
    if (monday !== weekStart) onSelect(monday);
  };
  // Chỉ chuyển tuần khi bấm "Mở": đang gõ dở ngày thì ô ngày đã báo thay đổi với giá trị chưa xong.
  const openDate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const date = String(new FormData(event.currentTarget).get("date") ?? "");
    if (isISODate(date)) select(weekStartOf(date));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" aria-label={`Chọn tuần, đang xem ${formatWeekRange(weekStart)}`}
          className="h-9 gap-2 px-3 font-medium">
          <CalendarDays className="size-4 opacity-60" />
          {formatWeekRange(weekStart)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-2">
        <ul>
          {weeks.map((monday) => (
            <li key={monday}>
              <button type="button" aria-current={monday === weekStart ? "true" : undefined} onClick={() => select(monday)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-accent focus-visible:bg-accent",
                  monday === weekStart && "font-medium",
                )}>
                <Check className={cn("size-4 shrink-0", monday === weekStart ? "opacity-100" : "opacity-0")} />
                <span className="flex-1">{formatWeekRange(monday)}</span>
                {monday === thisWeek && <span className="text-xs text-muted-foreground">Tuần này</span>}
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={openDate} className="mt-2 flex items-center gap-2 border-t px-2 pt-3 pb-1">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted-foreground">
            Tuần chứa ngày
            <input type="date" name="date" required defaultValue={weekStart}
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <Button type="submit" variant="outline" size="sm" className="self-end">Mở</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

/** Đang lưu / đã lưu / có lỗi lưu. Nội dung lỗi nằm ở thông báo nổi cuối màn hình. */
function SaveIndicator() {
  const status = useSaveStatus();

  if (status.saving > 0) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Đang lưu…
      </span>
    );
  }
  if (status.error) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-destructive">
        <CircleAlert className="size-4" />
        Có thay đổi chưa lưu được
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
