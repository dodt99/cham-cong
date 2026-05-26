"use client";

import { EveningDaySection } from "@/components/attendance/evening-day-section";
import { WEEKDAY_DAY_KEYS } from "@/lib/attendance/evening-selectors";
import { selectActiveWeekStart } from "@/lib/attendance/selectors";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function EveningTabContent() {
  const weekStart = useAttendanceZustandStore(selectActiveWeekStart);

  if (!weekStart) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {WEEKDAY_DAY_KEYS.map((day) => (
        <EveningDaySection key={day} weekStart={weekStart} day={day} />
      ))}
    </div>
  );
}
