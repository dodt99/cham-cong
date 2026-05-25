"use client";

import { ShiftSelect } from "@/components/attendance/shift-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EMPLOYEES } from "@/lib/constants/employees";
import { getShiftByCode } from "@/lib/constants/shifts";
import {
  DAY_KEYS,
  type DayKey,
  type WeekSheet,
} from "@/lib/types/attendance";
import { formatDayHeader } from "@/lib/utils/week";

type AttendanceTableProps = {
  sheet: WeekSheet;
  onDefaultShift: (employeeId: string, code: string | null) => void;
  onDayShift: (employeeId: string, day: DayKey, code: string | null) => void;
  onExtraEvening: (
    employeeId: string,
    day: DayKey,
    checked: boolean,
  ) => void;
};

function getShiftNote(code: string | null): string | undefined {
  if (!code) return undefined;
  const shift = getShiftByCode(code);
  return shift ? shift.note : undefined;
}

export function AttendanceTable({
  sheet,
  onDefaultShift,
  onDayShift,
  onExtraEvening,
}: AttendanceTableProps) {
  const { weekStart } = sheet;

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
          {EMPLOYEES.map((employee) => {
            const row = sheet.rows[employee.id];
            if (!row) return null;

            return (
              <TableRow key={employee.id}>
                <TableCell className="sticky left-0 z-10 bg-background font-mono text-xs">
                  {employee.id}
                </TableCell>
                <TableCell className="sticky left-[90px] z-10 bg-background font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                  {employee.fullName}
                </TableCell>
                <TableCell>
                  <ShiftSelect
                    value={row.defaultShiftCode}
                    onChange={(code) => onDefaultShift(employee.id, code)}
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
                          onChange={(code) =>
                            onDayShift(employee.id, day, code)
                          }
                          className="w-full min-w-[150px]"
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`${employee.id}-${day}-evening`}
                            checked={dayEntry.extraEvening}
                            onCheckedChange={(checked) =>
                              onExtraEvening(
                                employee.id,
                                day,
                                checked === true,
                              )
                            }
                          />
                          <Label
                            htmlFor={`${employee.id}-${day}-evening`}
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
          })}
        </TableBody>
      </Table>
    </div>
  );
}
