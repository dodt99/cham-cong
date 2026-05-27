"use client";

import { AttendanceEmployeeRow } from "@/components/attendance/attendance-employee-row";
import { AttendanceEmployeeList } from "@/components/attendance/attendance-employee-list";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WEEKDAY_DAY_KEYS } from "@/lib/attendance/evening-selectors";
import { selectActiveWeekStart } from "@/lib/attendance/selectors";
import { EMPLOYEES } from "@/lib/constants/employees";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { formatDayHeader } from "@/lib/utils/week";

export function WeekdayAttendanceTable() {
  const weekStart = useAttendanceZustandStore(selectActiveWeekStart);

  if (!weekStart) return null;

  return (
    <>
      <div className="md:hidden">
        <AttendanceEmployeeList dayKeys={WEEKDAY_DAY_KEYS} showDefaultColumn />
      </div>
      <div className="hidden min-w-0 max-w-full rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 min-w-[90px] bg-background">
                Mã NV
              </TableHead>
              <TableHead className="sticky left-[90px] z-20 min-w-[160px] bg-background shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                Họ và tên
              </TableHead>
              <TableHead className="min-w-[200px]">Mặc định</TableHead>
              {WEEKDAY_DAY_KEYS.map((day) => (
                <TableHead key={day} className="min-w-[220px] text-center">
                  {formatDayHeader(weekStart, day)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {EMPLOYEES.map((employee) => (
              <AttendanceEmployeeRow
                key={employee.id}
                employee={employee}
                dayKeys={WEEKDAY_DAY_KEYS}
                showDefaultColumn
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
