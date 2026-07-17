"use client";

import { memo } from "react";

import {
  AttendanceDayCell,
  AttendanceDefaultColumnCell,
} from "@/components/attendance/attendance-table-cells";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DEFAULT_SELECT_TONE_CLASS,
  getDaySelectToneClass,
} from "@/lib/attendance/column-colors";
import type { Employee } from "@/lib/constants/employees";
import { DAY_KEYS, type DayKey } from "@/lib/types/attendance";

type AttendanceEmployeeRowProps = {
  employee: Employee;
  dayKeys?: readonly DayKey[];
  showDefaultColumn?: boolean;
  colorizeColumns?: boolean;
};

function AttendanceEmployeeRowInner({
  employee,
  dayKeys = DAY_KEYS,
  showDefaultColumn = true,
  colorizeColumns = false,
}: AttendanceEmployeeRowProps) {
  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 bg-background font-mono text-xs">
        {employee.id}
      </TableCell>
      <TableCell className="sticky left-[60px] z-10 bg-background font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
        {employee.fullName}
      </TableCell>
      {showDefaultColumn && (
        <AttendanceDefaultColumnCell
          employeeId={employee.id}
          selectToneClassName={
            colorizeColumns ? DEFAULT_SELECT_TONE_CLASS : undefined
          }
        />
      )}
      {dayKeys.map((day) => (
        <AttendanceDayCell
          key={day}
          employeeId={employee.id}
          day={day}
          selectToneClassName={
            colorizeColumns ? getDaySelectToneClass(day) : undefined
          }
        />
      ))}
    </TableRow>
  );
}

export const AttendanceEmployeeRow = memo(AttendanceEmployeeRowInner);
