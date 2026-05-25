"use client";

import { AttendanceEmployeeRow } from "@/components/attendance/attendance-employee-row";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { selectActiveWeekStart } from "@/lib/attendance/selectors";
import { EMPLOYEES } from "@/lib/constants/employees";
import { DAY_KEYS } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { formatDayHeader } from "@/lib/utils/week";

export function AttendanceTable() {
  const weekStart = useAttendanceZustandStore(selectActiveWeekStart);

  if (!weekStart) return null;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-20 min-w-[90px] bg-background">
              Mã NV
            </TableHead>
            <TableHead className="sticky left-[90px] z-20 min-w-[160px] bg-background shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
              Họ và tên
            </TableHead>
            <TableHead className="min-w-[150px]">Ca mặc định</TableHead>
            {DAY_KEYS.map((day) => (
              <TableHead key={day} className="min-w-[180px] text-center">
                {formatDayHeader(weekStart, day)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {EMPLOYEES.map((employee) => (
            <AttendanceEmployeeRow
              key={employee.id}
              employeeId={employee.id}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
