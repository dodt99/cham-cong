"use client";

import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { ShiftSelect } from "@/components/attendance/shift-select";
import { WorkLocationSelect } from "@/components/attendance/work-location-select";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  selectDayEntry,
  selectEmployeeDefaults,
} from "@/lib/attendance/selectors";
import type { DayKey } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

type FieldsLayout = "column" | "row";

type AttendanceDefaultFieldsProps = {
  employeeId: string;
  className?: string;
  layout?: FieldsLayout;
};

function AttendanceDefaultFieldsInner({
  employeeId,
  className,
  layout = "column",
}: AttendanceDefaultFieldsProps) {
  const defaults = useAttendanceZustandStore(
    useShallow(selectEmployeeDefaults(employeeId)),
  );
  const setDefaultShift = useAttendanceZustandStore((s) => s.setDefaultShift);
  const setDefaultLocation = useAttendanceZustandStore(
    (s) => s.setDefaultLocation,
  );

  const onShiftChange = useCallback(
    (code: string | null) => setDefaultShift(employeeId, code),
    [setDefaultShift, employeeId],
  );
  const onLocationChange = useCallback(
    (key: string | null) => setDefaultLocation(employeeId, key),
    [setDefaultLocation, employeeId],
  );

  if (!defaults) return null;

  const isRow = layout === "row";
  const fieldClassName = isRow ? "min-w-0 flex-1" : "w-full min-w-0";

  return (
    <div
      className={cn(
        "flex gap-2",
        isRow ? "flex-row items-start" : "flex-col gap-1",
        className,
      )}
    >
      <ShiftSelect
        variant="default"
        value={defaults.defaultShiftCode}
        onChange={onShiftChange}
        className={fieldClassName}
      />
      <WorkLocationSelect
        value={defaults.defaultLocationKey}
        onChange={onLocationChange}
        className={fieldClassName}
      />
    </div>
  );
}

export const AttendanceDefaultFields = memo(AttendanceDefaultFieldsInner);

type AttendanceDefaultColumnCellProps = {
  employeeId: string;
};

function AttendanceDefaultColumnCellInner({
  employeeId,
}: AttendanceDefaultColumnCellProps) {
  return (
    <TableCell className="align-top">
      <AttendanceDefaultFields
        employeeId={employeeId}
        className="min-w-[150px] max-w-[200px]"
      />
    </TableCell>
  );
}

export const AttendanceDefaultColumnCell = memo(
  AttendanceDefaultColumnCellInner,
);

type AttendanceDayFieldsProps = {
  employeeId: string;
  day: DayKey;
  className?: string;
  align?: "start" | "center";
  layout?: FieldsLayout;
};

function AttendanceDayFieldsInner({
  employeeId,
  day,
  className,
  align = "center",
  layout = "column",
}: AttendanceDayFieldsProps) {
  const dayEntry = useAttendanceZustandStore(selectDayEntry(employeeId, day));
  const setDayShift = useAttendanceZustandStore((s) => s.setDayShift);
  const setDayLocation = useAttendanceZustandStore((s) => s.setDayLocation);

  const isWeekend = day === "sat" || day === "sun";

  const onShiftChange = useCallback(
    (code: string | null) => setDayShift(employeeId, day, code),
    [setDayShift, employeeId, day],
  );
  const onLocationChange = useCallback(
    (key: string | null) => setDayLocation(employeeId, day, key),
    [setDayLocation, employeeId, day],
  );

  if (!dayEntry) return null;

  const isRow = layout === "row";
  const fieldClassName = isRow ? "min-w-0 flex-1" : "w-full min-w-0";

  return (
    <div
      className={cn(
        "flex gap-2",
        isRow ? "flex-row items-start" : "flex-col gap-1",
        !isRow && align === "center" && "items-center px-2",
        className,
      )}
    >
      <ShiftSelect
        variant={isWeekend ? "weekend" : "weekday"}
        value={dayEntry.shiftCode}
        onChange={onShiftChange}
        className={fieldClassName}
      />
      <WorkLocationSelect
        variant={isWeekend ? "weekend" : "default"}
        value={dayEntry.locationKey}
        onChange={onLocationChange}
        // disabled={dayEntry.shiftCode === null}
        className={fieldClassName}
      />
    </div>
  );
}

export const AttendanceDayFields = memo(AttendanceDayFieldsInner);

type AttendanceDayCellProps = {
  employeeId: string;
  day: DayKey;
};

function AttendanceDayCellInner({ employeeId, day }: AttendanceDayCellProps) {
  return (
    <TableCell className="align-top">
      <AttendanceDayFields
        employeeId={employeeId}
        day={day}
        className="min-w-[150px] max-w-[200px]"
      />
    </TableCell>
  );
}

export const AttendanceDayCell = memo(AttendanceDayCellInner);
