"use client";

import { useMemo, useState } from "react";

import { WorkLocationSelect } from "@/components/attendance/work-location-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EMPTY_EVENING_ASSIGNMENTS,
  buildEveningAssignments,
} from "@/lib/attendance/evening-selectors";
import { EMPLOYEES } from "@/lib/constants/employees";
import type { DayKey } from "@/lib/types/attendance";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { formatDayHeader } from "@/lib/utils/week";
import { Trash2 } from "lucide-react";

const EMPTY_EMPLOYEE_VALUE = "__empty_employee__";

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
  const [pendingEmployeeId, setPendingEmployeeId] = useState(
    EMPTY_EMPLOYEE_VALUE,
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
    if (pendingEmployeeId === EMPTY_EMPLOYEE_VALUE) return;
    setExtraEvening(pendingEmployeeId, day, true);
    if (pendingLocationKey) {
      setEveningLocation(pendingEmployeeId, day, pendingLocationKey);
    }
    setPendingEmployeeId(EMPTY_EMPLOYEE_VALUE);
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
              className="flex items-center gap-2 rounded-md border bg-background p-2"
            >
              <span className="min-w-[140px] flex-1 min-w-0 text-sm font-medium">
                <span className="font-mono text-xs text-muted-foreground">
                  {assignment.employeeId}
                </span>
                <span className="ml-2">{getEmployeeName(assignment.employeeId)}</span>
              </span>
              <WorkLocationSelect
                value={assignment.eveningLocationKey}
                onChange={(key) =>
                  setEveningLocation(assignment.employeeId, day, key)
                }
                placeholder="Vị trí ca tối"
                className="w-[200px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Xóa phân công ca tối"
                onClick={() =>
                  setExtraEvening(assignment.employeeId, day, false)
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-dashed pt-3">
        <div className="grid min-w-[220px] gap-1">
          <Label htmlFor={`evening-add-${day}`} className="text-xs">
            Thêm nhân viên
          </Label>
          <Select
            value={pendingEmployeeId}
            onValueChange={setPendingEmployeeId}
          >
            <SelectTrigger id={`evening-add-${day}`} className="w-full">
              <SelectValue placeholder="Chọn nhân viên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY_EMPLOYEE_VALUE}>
                <span className="text-muted-foreground">-</span>
              </SelectItem>
              {availableEmployees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  <span className="font-mono text-xs text-muted-foreground">
                    {employee.id}
                  </span>
                  <span className="ml-2">{employee.fullName}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Vị trí</Label>
          <WorkLocationSelect
            value={pendingLocationKey}
            onChange={setPendingLocationKey}
            placeholder="Vị trí"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={handleAdd}
          disabled={
            pendingEmployeeId === EMPTY_EMPLOYEE_VALUE ||
            availableEmployees.length === 0
          }
        >
          Thêm
        </Button>
      </div>
    </section>
  );
}
