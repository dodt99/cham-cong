"use client";

import { memo } from "react";

import { ShiftSelect } from "@/components/attendance/shift-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { selectEmployeeRow } from "@/lib/attendance/selectors";
import { EMPLOYEES } from "@/lib/constants/employees";
import { DAY_KEYS } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

type AttendanceEmployeeRowProps = {
  employeeId: string;
};

function AttendanceEmployeeRowInner({ employeeId }: AttendanceEmployeeRowProps) {
  const row = useAttendanceZustandStore(selectEmployeeRow(employeeId));
  const setDefaultShift = useAttendanceZustandStore((s) => s.setDefaultShift);
  const setDayShift = useAttendanceZustandStore((s) => s.setDayShift);
  const setExtraEvening = useAttendanceZustandStore((s) => s.setExtraEvening);

  const employee = EMPLOYEES.find((e) => e.id === employeeId);
  if (!employee || !row) return null;

  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 bg-background font-mono text-xs">
        {employee.id}
      </TableCell>
      <TableCell className="sticky left-[90px] z-10 bg-background font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
        {employee.fullName}
      </TableCell>
      <TableCell>
        <ShiftSelect
          value={row.defaultShiftCode}
          onChange={(code) => setDefaultShift(employeeId, code)}
          placeholder="Ca mặc định"
          className="w-[150px]"
        />
      </TableCell>
      {DAY_KEYS.map((day) => {
        const dayEntry = row.days[day];

        return (
          <TableCell key={day} className="align-top">
            <div className="flex flex-row gap-2 px-5">
              <ShiftSelect
                value={dayEntry.shiftCode}
                onChange={(code) => setDayShift(employeeId, day, code)}
                className="w-full min-w-[150px]"
              />
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`${employeeId}-${day}-evening`}
                  checked={dayEntry.extraEvening}
                  onCheckedChange={(checked) =>
                    setExtraEvening(employeeId, day, checked === true)
                  }
                />
                <Label
                  htmlFor={`${employeeId}-${day}-evening`}
                  className="cursor-pointer text-xs font-normal whitespace-nowrap"
                >
                  Tối
                </Label>
              </div>
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export const AttendanceEmployeeRow = memo(AttendanceEmployeeRowInner);
