"use client";

import { WeekTabs } from "@/components/attendance/week-tabs";
import {
  selectActiveWeekStart,
  selectWeekStarts,
} from "@/lib/attendance/selectors";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { useShallow } from "zustand/react/shallow";

export function AttendanceWeekTabs() {
  const weekStarts = useAttendanceZustandStore(useShallow(selectWeekStarts));
  const activeWeekStart = useAttendanceZustandStore(selectActiveWeekStart);
  const setActiveWeek = useAttendanceZustandStore((s) => s.setActiveWeek);

  return (
    <WeekTabs
      weekStarts={weekStarts}
      activeWeekStart={activeWeekStart}
      onChange={setActiveWeek}
    />
  );
}
