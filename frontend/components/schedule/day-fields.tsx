"use client";

import { memo, useCallback } from "react";

import { LocationSelect } from "@/components/schedule/location-select";
import { useScheduleEnvironment } from "@/components/schedule/schedule-context";
import { ShiftSelect } from "@/components/schedule/shift-select";
import type { Assignment, CellRef } from "@/lib/api/types";
import { cellWarning } from "@/lib/schedule/model";
import { cn } from "@/lib/utils";
import { isWeekend } from "@/lib/week";

type DayFieldsProps = {
  employeeId: number;
  date: string;
  /** Phân công khe MAIN của ngày; undefined = chưa xếp. */
  assignment: Assignment | undefined;
  /** "column": ca trên, địa điểm dưới (bảng). "row": cạnh nhau (thẻ mobile). */
  layout?: "column" | "row";
  toneClassName?: string;
  className?: string;
};

/** Hai ô chọn của một ngày: ca (hoặc nghỉ) và địa điểm. Đổi ca giữ địa điểm; chọn nghỉ xoá địa điểm. */
function DayFieldsInner({ employeeId, date, assignment, layout = "column", toneClassName, className }: DayFieldsProps) {
  const { view, write, canEdit } = useScheduleEnvironment();
  const weekend = isWeekend(date);
  const shiftId = assignment?.shiftId ?? null;
  const locationId = assignment?.locationId ?? null;

  const cellRef = useCallback((): CellRef => ({ employeeId, date, slot: "MAIN" }), [employeeId, date]);
  const onSelectShift = useCallback(
    (nextShiftId: number) => write(cellRef(), { shiftId: nextShiftId, offTypeId: null, locationId }),
    [write, cellRef, locationId],
  );
  const onSelectOff = useCallback(
    (offTypeId: number) => write(cellRef(), { shiftId: null, offTypeId, locationId: null }),
    [write, cellRef],
  );
  const onClear = useCallback(() => write(cellRef(), null), [write, cellRef]);
  const onLocationChange = useCallback(
    (nextLocationId: number | null) => {
      if (shiftId !== null) write(cellRef(), { shiftId, offTypeId: null, locationId: nextLocationId });
    },
    [write, cellRef, shiftId],
  );

  const isRow = layout === "row";
  const fieldClassName = isRow ? "min-w-0 flex-1" : "w-full min-w-0";

  return (
    <div className={cn("flex gap-2", isRow ? "flex-row items-start" : "flex-col items-center gap-1", className)}>
      <ShiftSelect
        groups={weekend ? view.weekendShiftGroups : view.weekdayShiftGroups}
        offTypes={weekend ? undefined : view.catalog.offTypes}
        shift={shiftId === null ? undefined : view.shiftById.get(shiftId)}
        offType={view.catalog.offTypes.find((offType) => offType.id === assignment?.offTypeId)}
        emptyLabel={weekend ? "Nghỉ" : "Chưa xếp"}
        onSelectShift={onSelectShift}
        onSelectOff={onSelectOff}
        onClear={onClear}
        disabled={!canEdit}
        className={fieldClassName}
        toneClassName={toneClassName}
      />
      <LocationSelect
        locations={weekend ? view.weekendLocations : view.weekdayLocations}
        blocks={view.catalog.blocks}
        location={locationId === null ? undefined : view.locationById.get(locationId)}
        onChange={onLocationChange}
        warning={cellWarning(view, { shiftId, locationId })}
        disabled={!canEdit || shiftId === null}
        className={fieldClassName}
        toneClassName={toneClassName}
      />
    </div>
  );
}

export const DayFields = memo(DayFieldsInner);
