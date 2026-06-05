"use client";

import { useCallback, useState } from "react";

import { AttendanceEmployeeMobileCard } from "@/components/attendance/attendance-employee-mobile-card";
import { selectActiveWeekStart } from "@/lib/attendance/selectors";
import { EMPLOYEES, type Employee } from "@/lib/constants/employees";
import type { DayKey } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

type AttendanceEmployeeListProps = {
  dayKeys: readonly DayKey[];
  showDefaultColumn?: boolean;
  colorizeColumns?: boolean;
  employees?: Employee[];
};

export function AttendanceEmployeeList({
  dayKeys,
  showDefaultColumn = true,
  colorizeColumns = false,
  employees = EMPLOYEES,
}: AttendanceEmployeeListProps) {
  const weekStart = useAttendanceZustandStore(selectActiveWeekStart);
  const [openEmployeeId, setOpenEmployeeId] = useState<string | null>(null);

  const handleOpenChange = useCallback(
    (employeeId: string, open: boolean) => {
      setOpenEmployeeId(open ? employeeId : null);
    },
    [],
  );

  if (!weekStart) return null;

  if (employees.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Không tìm thấy nhân viên phù hợp.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {employees.map((employee) => (
        <li key={employee.id}>
          <AttendanceEmployeeMobileCard
            employee={employee}
            weekStart={weekStart}
            dayKeys={dayKeys}
            showDefaultColumn={showDefaultColumn}
            colorizeColumns={colorizeColumns}
            isOpen={openEmployeeId === employee.id}
            onOpenChange={handleOpenChange}
          />
        </li>
      ))}
    </ul>
  );
}
