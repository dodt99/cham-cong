"use client";

import { useMemo, useState } from "react";

import { EmployeeSelect } from "@/components/attendance/employee-select";
import { WorkLocationSelect } from "@/components/attendance/work-location-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  EMPTY_EVENING_ASSIGNMENTS,
  buildEveningAssignments,
} from "@/lib/attendance/evening-selectors";
import { EMPLOYEES } from "@/lib/constants/employees";
import type { DayKey } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { formatDayHeader } from "@/lib/utils/week";
import { Trash2 } from "lucide-react";

type EveningDaySectionProps = {
  weekStart: string;
  day: DayKey;
};

export function EveningDaySection({ weekStart, day }: EveningDaySectionProps) {
  const activeWeekStart = useAttendanceZustandStore((s) => s.activeWeekStart);
  const sheets = useAttendanceZustandStore((s) => s.sheets);

  const assignments = useMemo(() => {
    if (!activeWeekStart) return EMPTY_EVENING_ASSIGNMENTS;
    const sheet = sheets[activeWeekStart];
    if (!sheet) return EMPTY_EVENING_ASSIGNMENTS;
    return buildEveningAssignments(sheet, day);
  }, [activeWeekStart, sheets, day]);
  const setExtraEvening = useAttendanceZustandStore((s) => s.setExtraEvening);
  const setEveningLocation = useAttendanceZustandStore(
    (s) => s.setEveningLocation,
  );
  const [pendingEmployeeId, setPendingEmployeeId] = useState<string | null>(
    null,
  );
  const [pendingLocationKey, setPendingLocationKey] = useState<string | null>(
    null,
  );

  const assignedIds = useMemo(
    () => new Set(assignments.map((a) => a.employeeId)),
    [assignments],
  );

  const availableEmployees = useMemo(
    () => EMPLOYEES.filter((e) => !assignedIds.has(e.id)),
    [assignedIds],
  );

  const handleAdd = () => {
    if (!pendingEmployeeId) return;
    setExtraEvening(pendingEmployeeId, day, true);
    if (pendingLocationKey) {
      setEveningLocation(pendingEmployeeId, day, pendingLocationKey);
    }
    setPendingEmployeeId(null);
    setPendingLocationKey(null);
  };

  const getEmployeeName = (employeeId: string) =>
    EMPLOYEES.find((e) => e.id === employeeId)?.fullName ?? employeeId;

  return (
    <section className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">
        {formatDayHeader(weekStart, day)}
      </h3>

      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chưa có nhân viên ca tối.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {assignments.map((assignment) => (
            <li
              key={assignment.employeeId}
              className="relative flex flex-col gap-2 rounded-md border bg-background p-2 sm:flex-row sm:items-center"
            >
              <span className="min-w-0 flex-1 text-sm font-medium">
                <span className="font-mono text-xs text-muted-foreground">
                  {assignment.employeeId}
                </span>
                <span className="ml-2 break-words">
                  {getEmployeeName(assignment.employeeId)}
                </span>
              </span>
              <WorkLocationSelect
                variant="evening"
                value={assignment.eveningLocationKey}
                onChange={(key) =>
                  setEveningLocation(assignment.employeeId, day, key)
                }
                className="w-full shrink-0 sm:w-[200px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Xóa phân công ca tối"
                onClick={() =>
                  setExtraEvening(assignment.employeeId, day, false)
                }
                className="absolute right-0 top-0 sm:static"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-dashed pt-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="grid w-full min-w-0 gap-1 sm:min-w-[12rem] sm:flex-1 sm:max-w-xs">
          {/* <Label htmlFor={`evening-add-${day}`} className="text-xs">
            Thêm nhân viên
          </Label> */}
          <EmployeeSelect
            id={`evening-add-${day}`}
            value={pendingEmployeeId}
            onChange={setPendingEmployeeId}
            employees={availableEmployees}
            className="w-full"
            disabled={availableEmployees.length === 0}
          />
        </div>
        <div className="grid w-full min-w-0 gap-1 sm:w-auto sm:min-w-[12rem]">
          <WorkLocationSelect
            variant="evening"
            value={pendingLocationKey}
            onChange={setPendingLocationKey}
            className="w-full sm:w-[200px]"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAdd}
          disabled={!pendingEmployeeId || availableEmployees.length === 0}
        >
          Thêm
        </Button>
      </div>
    </section>
  );
}
