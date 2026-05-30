import { WEEKDAY_DAY_KEYS } from "@/lib/attendance/evening-selectors";
import { EMPLOYEES_EVENING_AND_WEEKEND } from "@/lib/constants/employees";
import { getShiftByCode, type ShiftTime } from "@/lib/constants/shifts";
import { getWorkLocationBlock, getEveningWorkLocationPriority } from "@/lib/constants/work-locations";
import { EVENING_SHIFT_CODE } from "@/lib/export/constants";
import {
  EVENING_JOB_DESCRIPTION,
  EVENING_JOB_TITLE,
} from "@/lib/export/evening-constants";
import {
  createEmptyEmployeeRow,
  DAY_LABELS,
  type DayKey,
  type WeekSheet,
} from "@/lib/types/attendance";
import { getDayDate } from "@/lib/utils/week";

export type EveningAttendanceRow = {
  dayKey: DayKey;
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

const eveningShift = getShiftByCode(EVENING_SHIFT_CODE);

export function getEveningDayLabel(dayKey: DayKey): string {
  return DAY_LABELS[dayKey];
}

export function buildEveningAttendanceRows(
  sheet: WeekSheet
): EveningAttendanceRow[] {
  const rows: EveningAttendanceRow[] = [];

  for (const day of WEEKDAY_DAY_KEYS) {
    const weekDayRows = [];
    for (const employee of EMPLOYEES_EVENING_AND_WEEKEND) {
      const weekRow = sheet.rows[employee.id] ?? createEmptyEmployeeRow();
      const entry = weekRow.days[day];
      if (!entry.extraEvening) continue;

      weekDayRows.push({
        dayKey: day,
        workDate: getDayDate(sheet.weekStart, day),
        employeeId: employee.id,
        fullName: employee.fullName,
        jobTitle: EVENING_JOB_TITLE,
        assignedStart: eveningShift?.assignedStart ?? null,
        assignedEnd: eveningShift?.assignedEnd ?? null,
        jobDescription: EVENING_JOB_DESCRIPTION,
        locationBlock: getWorkLocationBlock(entry.eveningLocationKey),
        taxCode: employee.taxCode,
      });
    }

    weekDayRows.sort((a, b) => getEveningWorkLocationPriority(a.locationBlock) - getEveningWorkLocationPriority(b.locationBlock));

    rows.push(...weekDayRows);
  }

  return rows;
}

/** @internal Exported for tests */
export function buildEveningRowForEmployeeDay(
  weekStart: string,
  employeeId: string,
  day: DayKey,
  extraEvening: boolean,
  eveningLocationKey: string | null = null
): EveningAttendanceRow | null {
  if (!extraEvening) return null;

  const employee = EMPLOYEES_EVENING_AND_WEEKEND.find(
    (e) => e.id === employeeId
  );
  if (!employee) return null;

  return {
    dayKey: day,
    workDate: getDayDate(weekStart, day),
    employeeId: employee.id,
    fullName: employee.fullName,
    jobTitle: EVENING_JOB_TITLE,
    assignedStart: eveningShift?.assignedStart ?? null,
    assignedEnd: eveningShift?.assignedEnd ?? null,
    jobDescription: EVENING_JOB_DESCRIPTION,
    locationBlock: getWorkLocationBlock(eveningLocationKey),
    taxCode: employee.taxCode,
  };
}
