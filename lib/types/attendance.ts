export const DAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

export type DayKey = (typeof DAY_KEYS)[number];

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "T2",
  tue: "T3",
  wed: "T4",
  thu: "T5",
  fri: "T6",
  sat: "T7",
  sun: "CN",
};

export type DayEntry = {
  shiftCode: string | null;
  extraEvening: boolean;
};

export type EmployeeWeekRow = {
  defaultShiftCode: string | null;
  days: Record<DayKey, DayEntry>;
};

export type WeekSheet = {
  weekStart: string;
  rows: Record<string, EmployeeWeekRow>;
};

export type AttendanceStore = {
  sheets: Record<string, WeekSheet>;
  activeWeekStart: string | null;
};

export function createEmptyDayEntry(): DayEntry {
  return { shiftCode: null, extraEvening: false };
}

export function createEmptyEmployeeRow(): EmployeeWeekRow {
  return {
    defaultShiftCode: null,
    days: DAY_KEYS.reduce(
      (acc, day) => {
        acc[day] = createEmptyDayEntry();
        return acc;
      },
      {} as Record<DayKey, DayEntry>,
    ),
  };
}
