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
import { WEEKDAY_DAY_KEYS } from "@/lib/attendance/evening-selectors";
import { selectActiveWeekStart } from "@/lib/attendance/selectors";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { formatDayHeader } from "@/lib/utils/week";

export function WeekdayAttendanceTable() {
  const weekStart = useAttendanceZustandStore(selectActiveWeekStart);
  const { searchInput, setSearchInput, filteredEmployees } = useEmployeeSearch();

  if (!weekStart) return null;

  const columnCount = WEEKDAY_DAY_KEYS.length + 3;

  return (
    <>
      <EmployeeSearchInput value={searchInput} onChange={setSearchInput} />
      <div className="md:hidden">
        <AttendanceEmployeeList
          dayKeys={WEEKDAY_DAY_KEYS}
          showDefaultColumn
          colorizeColumns
          employees={filteredEmployees}
        />
      </div>
      <div className="hidden min-w-0 max-w-full rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 min-w-[60px] bg-background">
                Mã NV
              </TableHead>
              <TableHead className="sticky left-[60px] z-20 min-w-[130px] bg-background shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                Họ và tên
              </TableHead>
              <TableHead className="min-w-[180px] text-center">
                Mặc định
              </TableHead>
              {WEEKDAY_DAY_KEYS.map((day) => (
                <TableHead key={day} className="min-w-[180px] text-center">
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
                  dayKeys={WEEKDAY_DAY_KEYS}
                  showDefaultColumn
                  colorizeColumns
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
