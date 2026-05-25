import type { AttendanceState } from "@/stores/attendance-store";
import type { DayEntry, DayKey, EmployeeWeekRow } from "@/lib/types/attendance";

export const selectActiveWeekStart = (s: AttendanceState) => s.activeWeekStart;

export const selectWeekStarts = (s: AttendanceState) =>
  Object.keys(s.sheets).sort();

export const selectHasActiveSheet = (s: AttendanceState): boolean => {
  const week = s.activeWeekStart;
  return !!(week && s.sheets[week]);
};

export const selectActiveSheet = (s: AttendanceState) => {
  const week = s.activeWeekStart;
  if (!week) return null;
  return s.sheets[week] ?? null;
};

export const selectEmployeeRow =
  (employeeId: string) =>
  (s: AttendanceState): EmployeeWeekRow | undefined => {
    const week = s.activeWeekStart;
    if (!week) return undefined;
    return s.sheets[week]?.rows[employeeId];
  };

export const selectDayEntry =
  (employeeId: string, day: DayKey) =>
  (s: AttendanceState): DayEntry | undefined =>
    selectEmployeeRow(employeeId)(s)?.days[day];
