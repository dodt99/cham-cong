"use client";

import { ClearAttendanceDataButton } from "@/components/attendance/clear-attendance-data-button";
import { CreateWeekDialog } from "@/components/attendance/create-week-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  selectActiveWeekStart,
  selectWeekStarts,
} from "@/lib/attendance/selectors";
import { formatWeekRange, sortWeekStarts } from "@/lib/utils/week";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { useShallow } from "zustand/react/shallow";

export function AttendancePageHeader() {
  const activeWeekStart = useAttendanceZustandStore(selectActiveWeekStart);
  const weekStarts = useAttendanceZustandStore(useShallow(selectWeekStarts));
  const createWeek = useAttendanceZustandStore((s) => s.createWeek);
  const setActiveWeek = useAttendanceZustandStore((s) => s.setActiveWeek);

  const sortedWeekStarts = sortWeekStarts(weekStarts);
  const selectedWeek = activeWeekStart ?? sortedWeekStarts[0] ?? null;

  return (
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-3">
        {/* <h1 className="text-2xl font-bold tracking-tight">Chấm công</h1> */}
        {sortedWeekStarts.length > 0 && selectedWeek && (
          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
            <Label htmlFor="week-select" className="shrink-0 text-xs text-muted-foreground">
              Tuần
            </Label>
            <Select value={selectedWeek} onValueChange={setActiveWeek}>
              <SelectTrigger id="week-select" className="w-full min-w-0 sm:max-w-xs">
                <SelectValue>{formatWeekRange(selectedWeek)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sortedWeekStarts.map((weekStart) => (
                  <SelectItem key={weekStart} value={weekStart}>
                    {formatWeekRange(weekStart)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <ClearAttendanceDataButton />
        <CreateWeekDialog
          onCreateWeek={createWeek}
          existingWeeks={weekStarts}
        />
      </div>
    </header>
  );
}
