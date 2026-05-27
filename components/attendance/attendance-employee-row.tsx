"use client";

import { memo } from "react";

import { ShiftSelect } from "@/components/attendance/shift-select";
import { WorkLocationSelect } from "@/components/attendance/work-location-select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { selectEmployeeRow } from "@/lib/attendance/selectors";
import { EMPLOYEES } from "@/lib/constants/employees";
import { DAY_KEYS, type DayKey } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

type AttendanceEmployeeRowProps = {
  employeeId: string;
  dayKeys?: readonly DayKey[];
  showDefaultColumn?: boolean;
  showEvening?: boolean;
};

function AttendanceEmployeeRowInner({
  employeeId,
  dayKeys = DAY_KEYS,
  showDefaultColumn = true,
  showEvening = true,
}: AttendanceEmployeeRowProps) {
  const row = useAttendanceZustandStore(selectEmployeeRow(employeeId));
  const setDefaultShift = useAttendanceZustandStore((s) => s.setDefaultShift);
  const setDefaultLocation = useAttendanceZustandStore(
    (s) => s.setDefaultLocation,
  );
  const setDayShift = useAttendanceZustandStore((s) => s.setDayShift);
  const setDayLocation = useAttendanceZustandStore((s) => s.setDayLocation);
  const setExtraEvening = useAttendanceZustandStore((s) => s.setExtraEvening);
  const setEveningLocation = useAttendanceZustandStore(
    (s) => s.setEveningLocation,
  );

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
      {showDefaultColumn && (
        <TableCell className="align-top">
          <div className="flex flex-col gap-1">
            <ShiftSelect
              variant="default"
              value={row.defaultShiftCode}
              onChange={(code) => setDefaultShift(employeeId, code)}
              placeholder="Ca mặc định"
              className="w-full min-w-[150px]"
            />
            <WorkLocationSelect
              value={row.defaultLocationKey}
              onChange={(key) => setDefaultLocation(employeeId, key)}
              placeholder="Địa điểm mặc định"
              className="w-full min-w-[150px]"
            />
          </div>
        </TableCell>
      )}
      {dayKeys.map((day) => {
        const dayEntry = row.days[day];
        const isWeekend = day === "sat" || day === "sun";

        return (
          <TableCell key={day} className="align-top">
            <div className="flex flex-col items-center gap-1 px-2">
              <ShiftSelect
                variant={isWeekend ? "weekend" : "weekday"}
                value={dayEntry.shiftCode}
                onChange={(code) => setDayShift(employeeId, day, code)}
                className="w-full min-w-[150px] max-w-[250px]"
              />
              <WorkLocationSelect
                variant={isWeekend ? "weekend" : "default"}
                value={dayEntry.locationKey}
                onChange={(key) => setDayLocation(employeeId, day, key)}
                disabled={dayEntry.shiftCode === null}
                className="w-full min-w-[150px] max-w-[250px]"
              />
              {showEvening && !isWeekend && (
                <div className="flex flex-row gap-2">
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
                  <WorkLocationSelect
                    variant="evening"
                    value={dayEntry.eveningLocationKey}
                    onChange={(key) =>
                      setEveningLocation(employeeId, day, key)
                    }
                    disabled={!dayEntry.extraEvening}
                    placeholder="Địa điểm tối"
                    className="w-full min-w-[150px]"
                  />
                </div>
              )}
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}

export const AttendanceEmployeeRow = memo(AttendanceEmployeeRowInner);
