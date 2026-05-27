"use client";

import { AttendanceEmployeeRow } from "@/components/attendance/attendance-employee-row";
import { AttendanceEmployeeList } from "@/components/attendance/attendance-employee-list";
import { EmployeeSearchInput } from "@/components/attendance/employee-search-input";
import { useEmployeeSearch } from "@/hooks/use-employee-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WEEKEND_DAY_KEYS } from "@/lib/attendance/evening-selectors";
import { selectActiveWeekStart } from "@/lib/attendance/selectors";
import { EMPLOYEES_EVENING_AND_WEEKEND } from "@/lib/constants/employees";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { formatDayHeader } from "@/lib/utils/week";

export function WeekendAttendanceTable() {
  const weekStart = useAttendanceZustandStore(selectActiveWeekStart);
  const { searchInput, setSearchInput, filteredEmployees } = useEmployeeSearch(
    EMPLOYEES_EVENING_AND_WEEKEND,
  );

  if (!weekStart) return null;

  const columnCount = WEEKEND_DAY_KEYS.length + 2;

  return (
    <>
      <EmployeeSearchInput value={searchInput} onChange={setSearchInput} />
      <div className="md:hidden">
        <AttendanceEmployeeList
          dayKeys={WEEKEND_DAY_KEYS}
          showDefaultColumn={false}
          employees={filteredEmployees}
        />
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
              {WEEKEND_DAY_KEYS.map((day) => (
                <TableHead key={day} className="min-w-[220px] text-center">
                  {formatDayHeader(weekStart, day)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy nhân viên phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <AttendanceEmployeeRow
                  key={employee.id}
                  employee={employee}
                  dayKeys={WEEKEND_DAY_KEYS}
                  showDefaultColumn={false}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
