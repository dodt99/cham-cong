"use client";

import { memo } from "react";

import {
  AttendanceDayCell,
  AttendanceDefaultColumnCell,
} from "@/components/attendance/attendance-table-cells";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Employee } from "@/lib/constants/employees";
import { DAY_KEYS, type DayKey } from "@/lib/types/attendance";

type AttendanceEmployeeRowProps = {
  employee: Employee;
  dayKeys?: readonly DayKey[];
  showDefaultColumn?: boolean;
};

function AttendanceEmployeeRowInner({
  employee,
  dayKeys = DAY_KEYS,
  showDefaultColumn = true,
}: AttendanceEmployeeRowProps) {
  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 bg-background font-mono text-xs">
        {employee.id}
      </TableCell>
      <TableCell className="sticky left-[90px] z-10 bg-background font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
        {employee.fullName}
      </TableCell>
      {showDefaultColumn && (
        <AttendanceDefaultColumnCell employeeId={employee.id} />
      )}
      {dayKeys.map((day) => (
        <AttendanceDayCell key={day} employeeId={employee.id} day={day} />
      ))}
    </TableRow>
  );
}

export const AttendanceEmployeeRow = memo(AttendanceEmployeeRowInner);
