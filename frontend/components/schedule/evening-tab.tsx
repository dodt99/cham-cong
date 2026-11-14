"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { EmployeeSelect } from "@/components/schedule/employee-select";
import { LocationSelect } from "@/components/schedule/location-select";
import { useScheduleEnvironment } from "@/components/schedule/schedule-context";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Assignment, CellRef, Member, Shift } from "@/lib/api/types";
import {
  getDayButtonToneClass,
  getDayCardToneClass,
  getDayHeaderTextClass,
  getDayItemToneClass,
} from "@/lib/schedule/day-colors";
import { type CellMap, cellKey, shiftHours } from "@/lib/schedule/model";
import { cn } from "@/lib/utils";
import { formatDayHeader } from "@/lib/week";

type EveningTabProps = { members: Member[]; dates: string[]; cells: CellMap };

/** Ca tối tăng cường T2→T6: mỗi ngày một thẻ, liệt kê người đã phân công và ô thêm người. */
export function EveningTab({ members, dates, cells }: EveningTabProps) {
  return (
    <div className="flex flex-col gap-4">
      {dates.map((date) => (
        <EveningDay key={date} date={date} members={members} cells={cells} />
      ))}
    </div>
  );
}

function EveningDay({ date, members, cells }: { date: string; members: Member[]; cells: CellMap }) {
  const { view, write, canEdit } = useScheduleEnvironment();
  const [pendingEmployeeId, setPendingEmployeeId] = useState<number | null>(null);
  const [pendingLocationId, setPendingLocationId] = useState<number | null>(null);
  const [pendingShiftId, setPendingShiftId] = useState<number | null>(null);
  // Thường đội chỉ có một ca tối (K15) nên không cần hỏi; có nhiều hơn thì hiện ô chọn, mặc định ca đầu.
  const shifts = view.eveningShifts;
  const pendingShift = shifts.find((shift) => shift.id === pendingShiftId) ?? shifts[0];

  const refOf = (employeeId: number): CellRef => ({ employeeId, date, slot: "EVENING" });
  const assigned = useMemo(
    () =>
      members.flatMap((member) => {
        const assignment = cells.get(cellKey({ employeeId: member.employeeId, date, slot: "EVENING" }));
        return assignment ? [{ member, assignment }] : [];
      }),
    [members, cells, date],
  );
  const available = useMemo(() => {
    const taken = new Set(assigned.map(({ member }) => member.employeeId));
    return members.filter((member) => !taken.has(member.employeeId));
  }, [members, assigned]);

  const update = (assignment: Assignment, change: { shiftId?: number; locationId?: number | null }) =>
    write(refOf(assignment.employeeId), {
      shiftId: assignment.shiftId, offTypeId: null, locationId: assignment.locationId, ...change });
  const add = () => {
    if (pendingEmployeeId === null || !pendingShift) return;
    write(refOf(pendingEmployeeId), { shiftId: pendingShift.id, offTypeId: null, locationId: pendingLocationId });
    setPendingEmployeeId(null);
    setPendingLocationId(null);
  };
  /** Các ca chọn được cho một người đã phân công: ca tối đang dùng, cộng ca của chính họ nếu ca đó đã ngừng dùng. */
  const shiftChoices = (assignment: Assignment): Shift[] => {
    const current = assignment.shiftId === null ? undefined : view.shiftById.get(assignment.shiftId);
    return current && !shifts.includes(current) ? [current, ...shifts] : shifts;
  };

  return (
    <section className={cn("rounded-lg border border-l-4 bg-card p-4", getDayCardToneClass(date))}>
      <h3 className={cn("mb-3 text-sm font-semibold", getDayHeaderTextClass(date))}>{formatDayHeader(date)}</h3>

      {assigned.length === 0 ? (
        <p className="text-sm italic text-muted-foreground/70">Chưa có nhân viên ca tối.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {assigned.map(({ member, assignment }) => (
            <li key={member.employeeId} className={cn(
              "relative flex flex-col gap-2 rounded-md px-3 py-2 sm:flex-row sm:items-center", getDayItemToneClass(date))}>
              <span className="min-w-0 flex-1 pr-8 text-sm font-medium sm:pr-0">
                <span className="font-mono text-xs text-muted-foreground">{member.code}</span>
                <span className="ml-2 break-words">{member.fullName}</span>
              </span>
              {shiftChoices(assignment).length > 1 && (
                <EveningShiftSelect shifts={shiftChoices(assignment)} value={assignment.shiftId}
                  onChange={(shiftId) => update(assignment, { shiftId })} disabled={!canEdit}
                  className="w-full shrink-0 sm:w-[170px]" />
              )}
              <LocationSelect
                locations={view.eveningLocations}
                blocks={view.catalog.blocks}
                location={assignment.locationId === null ? undefined : view.locationById.get(assignment.locationId)}
                onChange={(locationId) => update(assignment, { locationId })}
                warning={assignment.locationId === null ? "Chưa chọn địa điểm" : null}
                disabled={!canEdit}
                className="w-full shrink-0 sm:w-[200px]"
              />
              {canEdit && (
                <Button type="button" variant="ghost" size="icon" aria-label="Xóa phân công ca tối"
                  onClick={() => write(refOf(member.employeeId), null)} className="absolute right-0 top-0 sm:static">
                  <Trash2 className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && shifts.length === 0 && (
        <p role="status" className="mt-4 text-sm text-amber-700 dark:text-amber-300">
          Chưa có ca tối nào đang dùng nên chưa thêm được người. Thêm hoặc bật lại ca tối ở Quản trị → Ca làm việc.
        </p>
      )}
      {canEdit && shifts.length > 0 && (
        <div className="mt-4 flex flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="grid w-full min-w-0 gap-1 sm:max-w-xs sm:min-w-[12rem] sm:flex-1">
            <EmployeeSelect members={available} value={pendingEmployeeId} onChange={setPendingEmployeeId}
              disabled={available.length === 0} />
          </div>
          {shifts.length > 1 && (
            <EveningShiftSelect shifts={shifts} value={pendingShift.id} onChange={setPendingShiftId}
              className="w-full sm:w-[170px]" />
          )}
          <LocationSelect
            locations={view.eveningLocations}
            blocks={view.catalog.blocks}
            location={pendingLocationId === null ? undefined : view.locationById.get(pendingLocationId)}
            onChange={setPendingLocationId}
            className="w-full sm:w-[200px]"
          />
          <Button type="button" onClick={add} disabled={pendingEmployeeId === null}
            className={getDayButtonToneClass(date)}>
            Thêm
          </Button>
        </div>
      )}
    </section>
  );
}

/** Ô chọn ca tối — chỉ hiện khi có từ hai ca tối trở lên. */
function EveningShiftSelect({
  shifts,
  value,
  onChange,
  disabled,
  className,
}: {
  shifts: Shift[];
  value: number | null;
  onChange: (shiftId: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Select value={value === null ? undefined : String(value)} disabled={disabled}
      onValueChange={(next) => onChange(Number(next))}>
      <SelectTrigger aria-label="Ca tối" className={className}>
        <SelectValue placeholder="Ca tối" />
      </SelectTrigger>
      <SelectContent>
        {shifts.map((shift) => (
          <SelectItem key={shift.id} value={String(shift.id)}>
            <span className="font-mono text-xs text-muted-foreground">{shift.code}</span>
            <span className="ml-2">{shiftHours(shift)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
