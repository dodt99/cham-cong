"use client";

import { EveningDaySection } from "@/components/attendance/v2/evening-day-section";
import { WEEKDAY_DAY_KEYS } from "@/lib/attendance/evening-selectors";
import { selectActiveWeekStart } from "@/lib/attendance/selectors";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function EveningTabContent() {
  const weekStart = useAttendanceZustandStore(selectActiveWeekStart);

  if (!weekStart) return null;

  return (
    <div className="flex flex-col gap-4">
      {WEEKDAY_DAY_KEYS.map((day) => (
        <EveningDaySection key={day} weekStart={weekStart} day={day} />
      ))}
    </div>
  );
}
