"use client";

import { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";

import { ShiftSelect } from "@/components/attendance/shift-select";
import { WorkLocationSelect } from "@/components/attendance/work-location-select";
import { TableCell } from "@/components/ui/table";
import {
  selectDayEntry,
  selectEmployeeDefaults,
} from "@/lib/attendance/selectors";
import type { DayKey } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

type AttendanceDefaultColumnCellProps = {
  employeeId: string;
};

function AttendanceDefaultColumnCellInner({
  employeeId,
}: AttendanceDefaultColumnCellProps) {
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

  return (
    <TableCell className="align-top">
      <div className="flex flex-col gap-1">
        <ShiftSelect
          variant="default"
          value={defaults.defaultShiftCode}
          onChange={onShiftChange}
          className="w-full min-w-[150px]"
        />
        <WorkLocationSelect
          value={defaults.defaultLocationKey}
          onChange={onLocationChange}
          className="w-full min-w-[150px]"
        />
      </div>
    </TableCell>
  );
}

export const AttendanceDefaultColumnCell = memo(
  AttendanceDefaultColumnCellInner,
);

type AttendanceDayCellProps = {
  employeeId: string;
  day: DayKey;
};

function AttendanceDayCellInner({ employeeId, day }: AttendanceDayCellProps) {
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

  return (
    <TableCell className="align-top">
      <div className="flex flex-col items-center gap-1 px-2">
        <ShiftSelect
          variant={isWeekend ? "weekend" : "weekday"}
          value={dayEntry.shiftCode}
          onChange={onShiftChange}
          className="w-full min-w-[150px] max-w-[250px]"
        />
        <WorkLocationSelect
          variant={isWeekend ? "weekend" : "default"}
          value={dayEntry.locationKey}
          onChange={onLocationChange}
          disabled={dayEntry.shiftCode === null}
          className="w-full min-w-[150px] max-w-[250px]"
        />
      </div>
    </TableCell>
  );
}

export const AttendanceDayCell = memo(AttendanceDayCellInner);
