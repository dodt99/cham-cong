"use client";

import { memo } from "react";

import { selectDayEntry } from "@/lib/attendance/selectors";
import { DAY_LABELS, type DayKey } from "@/lib/types/attendance";
import { cn } from "@/lib/utils";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

type AttendanceEmployeeSummaryProps = {
  employeeId: string;
  dayKeys: readonly DayKey[];
  className?: string;
};

function AttendanceEmployeeSummaryInner({
  employeeId,
  dayKeys,
  className,
}: AttendanceEmployeeSummaryProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {dayKeys.map((day) => (
        <DaySummaryBadge key={day} employeeId={employeeId} day={day} />
      ))}
    </div>
  );
}

type DaySummaryBadgeProps = {
  employeeId: string;
  day: DayKey;
};

function DaySummaryBadge({ employeeId, day }: DaySummaryBadgeProps) {
  const dayEntry = useAttendanceZustandStore(selectDayEntry(employeeId, day));
  const hasShift = dayEntry?.shiftCode != null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
        hasShift
          ? "bg-secondary text-secondary-foreground"
          : "bg-muted/60 text-muted-foreground",
      )}
    >
      <span>{DAY_LABELS[day]}</span>
      <span className={cn(!hasShift && "opacity-70")}>
        {hasShift ? dayEntry.shiftCode : "—"}
      </span>
    </span>
  );
}

export const AttendanceEmployeeSummary = memo(AttendanceEmployeeSummaryInner);
