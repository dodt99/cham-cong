"use client";

import { useCallback, useState } from "react";

import { AttendanceEmployeeMobileCard } from "@/components/attendance/attendance-employee-mobile-card";
import { selectActiveWeekStart } from "@/lib/attendance/selectors";
import { EMPLOYEES } from "@/lib/constants/employees";
import type { DayKey } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

type AttendanceEmployeeListProps = {
  dayKeys: readonly DayKey[];
  showDefaultColumn?: boolean;
};

export function AttendanceEmployeeList({
  dayKeys,
  showDefaultColumn = true,
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

  return (
    <ul className="flex flex-col gap-2">
      {EMPLOYEES.map((employee) => (
        <li key={employee.id}>
          <AttendanceEmployeeMobileCard
            employee={employee}
            weekStart={weekStart}
            dayKeys={dayKeys}
            showDefaultColumn={showDefaultColumn}
            isOpen={openEmployeeId === employee.id}
            onOpenChange={handleOpenChange}
          />
        </li>
      ))}
    </ul>
  );
}
