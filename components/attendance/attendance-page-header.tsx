"use client";

import { ClearAttendanceDataButton } from "@/components/attendance/clear-attendance-data-button";
import { CreateWeekDialog } from "@/components/attendance/create-week-dialog";
import {
  selectActiveWeekStart,
  selectWeekStarts,
} from "@/lib/attendance/selectors";
import { formatWeekRange } from "@/lib/utils/week";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { useShallow } from "zustand/react/shallow";

export function AttendancePageHeader() {
  const activeWeekStart = useAttendanceZustandStore(selectActiveWeekStart);
  const weekStarts = useAttendanceZustandStore(useShallow(selectWeekStarts));
  const createWeek = useAttendanceZustandStore((s) => s.createWeek);

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chấm công</h1>
        {activeWeekStart && (
          <p className="mt-1 text-sm text-muted-foreground">
            Tuần đang xem:{" "}
            <span className="font-semibold text-foreground">
              {formatWeekRange(activeWeekStart)}
            </span>
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ClearAttendanceDataButton />
        <CreateWeekDialog
          onCreateWeek={createWeek}
          existingWeeks={weekStarts}
        />
      </div>
    </header>
  );
}
