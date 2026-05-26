import { EMPLOYEES } from "@/lib/constants/employees";
import { getShiftByCode, type ShiftTime } from "@/lib/constants/shifts";
import { getWorkLocationBlock } from "@/lib/constants/work-locations";
import {
  WEEKEND_JOB_DESCRIPTION,
  WEEKEND_JOB_TITLE,
} from "@/lib/export/weekend-constants";
import {
  createEmptyEmployeeRow,
  DAY_LABELS,
  type DayKey,
  type WeekSheet,
} from "@/lib/types/attendance";
import { getDayDate } from "@/lib/utils/week";

export type WeekendDayKey = "sat" | "sun";

export type WeekendAttendanceRow = {
  dayKey: WeekendDayKey;
  workDate: string;
  employeeId: string;
  fullName: string;
  jobTitle: string;
  assignedStart: ShiftTime | null;
  assignedEnd: ShiftTime | null;
  jobDescription: string;
  locationBlock: string | null;
  taxCode: string;
};

const WEEKEND_DAY_KEYS: WeekendDayKey[] = ["sat", "sun"];

export function getWeekendDayLabel(dayKey: WeekendDayKey): string {
  return DAY_LABELS[dayKey];
}

export function buildWeekendAttendanceRows(
  sheet: WeekSheet,
): WeekendAttendanceRow[] {
  const rows: WeekendAttendanceRow[] = [];

  for (const employee of EMPLOYEES) {
    const weekRow = sheet.rows[employee.id] ?? createEmptyEmployeeRow();

    for (const day of WEEKEND_DAY_KEYS) {
      const entry = weekRow.days[day];
      if (entry.shiftCode === null) continue;

      const shift = getShiftByCode(entry.shiftCode);

      rows.push({
        dayKey: day,
        workDate: getDayDate(sheet.weekStart, day),
        employeeId: employee.id,
        fullName: employee.fullName,
        jobTitle: WEEKEND_JOB_TITLE,
        assignedStart: shift?.assignedStart ?? null,
        assignedEnd: shift?.assignedEnd ?? null,
        jobDescription: WEEKEND_JOB_DESCRIPTION,
        locationBlock: getWorkLocationBlock(entry.locationKey),
        taxCode: employee.taxCode,
      });
    }
  }

  return rows;
}

/** @internal Exported for tests */
export function buildWeekendRowForEmployeeDay(
  weekStart: string,
  employeeId: string,
  day: WeekendDayKey,
  shiftCode: string | null,
  locationKey: string | null = null,
): WeekendAttendanceRow | null {
  if (shiftCode === null) return null;

  const employee = EMPLOYEES.find((e) => e.id === employeeId);
  if (!employee) return null;

  const shift = getShiftByCode(shiftCode);

  return {
    dayKey: day,
    workDate: getDayDate(weekStart, day as DayKey),
    employeeId: employee.id,
    fullName: employee.fullName,
    jobTitle: WEEKEND_JOB_TITLE,
    assignedStart: shift?.assignedStart ?? null,
    assignedEnd: shift?.assignedEnd ?? null,
    jobDescription: WEEKEND_JOB_DESCRIPTION,
    locationBlock: getWorkLocationBlock(locationKey),
    taxCode: employee.taxCode,
  };
}
