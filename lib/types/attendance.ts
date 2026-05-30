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

import type { OffType } from "@/lib/constants/off-types";

export type DayEntry = {
  shiftCode: string | null;
  offType: OffType | null;
  locationKey: string | null;
  extraEvening: boolean;
  eveningLocationKey: string | null;
};

export type EmployeeWeekRow = {
  defaultShiftCode: string | null;
  defaultOffType: OffType | null;
  defaultLocationKey: string | null;
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
  return {
    shiftCode: null,
    offType: null,
    locationKey: null,
    extraEvening: false,
    eveningLocationKey: null,
  };
}

export function createEmptyEmployeeRow(): EmployeeWeekRow {
  return {
    defaultShiftCode: null,
    defaultOffType: null,
    defaultLocationKey: null,
    days: DAY_KEYS.reduce(
      (acc, day) => {
        acc[day] = createEmptyDayEntry();
        return acc;
      },
      {} as Record<DayKey, DayEntry>,
    ),
  };
}
