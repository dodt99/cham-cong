import type { AttendanceState } from "@/stores/attendance-store";
import { EMPLOYEES_EVENING_AND_WEEKEND } from "@/lib/constants/employees";
import type { DayKey, WeekSheet } from "@/lib/types/attendance";

export type EveningAssignment = {
  employeeId: string;
  eveningLocationKey: string | null;
};

export const EMPTY_EVENING_ASSIGNMENTS: EveningAssignment[] = [];

export const WEEKDAY_DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];

export const WEEKEND_DAY_KEYS: DayKey[] = ["sat", "sun"];

export function buildEveningAssignments(
  sheet: WeekSheet,
  day: DayKey,
): EveningAssignment[] {
  return EMPLOYEES_EVENING_AND_WEEKEND.flatMap((employee) => {
    const entry = sheet.rows[employee.id]?.days[day];
    if (!entry?.extraEvening) return [];
    return [
      {
        employeeId: employee.id,
        eveningLocationKey: entry.eveningLocationKey,
      },
    ];
  });
}

export function selectEveningAssignments(day: DayKey) {
  return (s: AttendanceState): EveningAssignment[] => {
    const week = s.activeWeekStart;
    if (!week) return EMPTY_EVENING_ASSIGNMENTS;

    const sheet = s.sheets[week];
    if (!sheet) return EMPTY_EVENING_ASSIGNMENTS;

    return buildEveningAssignments(sheet, day);
  };
}
