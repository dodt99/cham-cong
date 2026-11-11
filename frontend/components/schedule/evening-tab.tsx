"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { EmployeeSelect } from "@/components/schedule/employee-select";
import { LocationSelect } from "@/components/schedule/location-select";
import { useScheduleEnvironment } from "@/components/schedule/schedule-context";
import { Button } from "@/components/ui/button";
import type { Assignment, CellRef, Member } from "@/lib/api/types";
import {
  getDayButtonToneClass,
  getDayCardToneClass,
  getDayHeaderTextClass,
  getDayItemToneClass,
} from "@/lib/schedule/day-colors";
import { type CellMap, cellKey } from "@/lib/schedule/model";
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

  // Máy chủ tự gán ca tối duy nhất của đội (K15) khi không gửi shiftId.
  const setLocation = (assignment: Assignment, locationId: number | null) =>
    write(refOf(assignment.employeeId), { shiftId: assignment.shiftId, offTypeId: null, locationId });
  const add = () => {
    if (pendingEmployeeId === null) return;
    write(refOf(pendingEmployeeId), { shiftId: null, offTypeId: null, locationId: pendingLocationId });
    setPendingEmployeeId(null);
    setPendingLocationId(null);
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
              <LocationSelect
                locations={view.eveningLocations}
                blocks={view.catalog.blocks}
                location={assignment.locationId === null ? undefined : view.locationById.get(assignment.locationId)}
                onChange={(locationId) => setLocation(assignment, locationId)}
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

      {canEdit && (
        <div className="mt-4 flex flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="grid w-full min-w-0 gap-1 sm:max-w-xs sm:min-w-[12rem] sm:flex-1">
            <EmployeeSelect members={available} value={pendingEmployeeId} onChange={setPendingEmployeeId}
              disabled={available.length === 0} />
          </div>
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
