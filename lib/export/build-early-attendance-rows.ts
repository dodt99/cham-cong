import { EMPLOYEES } from "@/lib/constants/employees";
import {
  getShiftByCode,
  isAfternoonOffShift,
  type ShiftTime,
} from "@/lib/constants/shifts";
import { getWorkLocationBlock } from "@/lib/constants/work-locations";
import {
  EARLY_JOB_TITLE_DEFAULT,
  EARLY_JOB_TITLE_MANAGER,
  EARLY_MANAGER_EMPLOYEE_ID,
} from "@/lib/export/early-constants";
import {
  createEmptyEmployeeRow,
  DAY_KEYS,
  type DayKey,
  type WeekSheet,
} from "@/lib/types/attendance";
import { getDayDate } from "@/lib/utils/week";

export type EarlyAttendanceRow = {
  workDate: string;
  employeeId: string;
  fullName: string;
  assignedStart: ShiftTime | null;
  assignedEnd: ShiftTime | null;
  jobTitle: string;
  locationBlock: string | null;
  taxCode: string;
};

const WEEKDAY_KEYS = DAY_KEYS.slice(0, 5);

function getEarlyAssignedEnd(
  shiftCode: string,
  shift: ReturnType<typeof getShiftByCode>,
): ShiftTime | null {
  if (isAfternoonOffShift(shiftCode)) return null;
  return shift?.assignedEnd ?? null;
}

export function getEarlyJobTitle(
  employeeId: string,
  shiftCode: string,
): string {
  const base =
    employeeId === EARLY_MANAGER_EMPLOYEE_ID
      ? EARLY_JOB_TITLE_MANAGER
      : EARLY_JOB_TITLE_DEFAULT;
  if (isAfternoonOffShift(shiftCode)) {
    return `${base} (Nghỉ chiều)`;
  }
  return base;
}

export function buildEarlyAttendanceRows(
  sheet: WeekSheet,
): EarlyAttendanceRow[] {
  const rows: EarlyAttendanceRow[] = [];

  for (const employee of EMPLOYEES) {
    const weekRow = sheet.rows[employee.id] ?? createEmptyEmployeeRow();

    for (const day of WEEKDAY_KEYS) {
      const entry = weekRow.days[day];
      if (entry.shiftCode === null) continue;

      const shift = getShiftByCode(entry.shiftCode);

      rows.push({
        workDate: getDayDate(sheet.weekStart, day),
        employeeId: employee.id,
        fullName: employee.fullName,
        assignedStart: shift?.assignedStart ?? null,
        assignedEnd: getEarlyAssignedEnd(entry.shiftCode, shift),
        jobTitle: getEarlyJobTitle(employee.id, entry.shiftCode),
        locationBlock: getWorkLocationBlock(entry.locationKey),
        taxCode: employee.taxCode,
      });
    }
  }

  return rows;
}

/** @internal Exported for tests */
export function buildEarlyRowsForEmployeeDay(
  weekStart: string,
  employeeId: string,
  day: DayKey,
  shiftCode: string | null,
  locationKey: string | null,
): EarlyAttendanceRow | null {
  if (shiftCode === null) return null;

  const employee = EMPLOYEES.find((e) => e.id === employeeId);
  if (!employee) return null;

  const shift = getShiftByCode(shiftCode);

  return {
    workDate: getDayDate(weekStart, day),
    employeeId: employee.id,
    fullName: employee.fullName,
    assignedStart: shift?.assignedStart ?? null,
    assignedEnd: getEarlyAssignedEnd(shiftCode, shift),
    jobTitle: getEarlyJobTitle(employee.id, shiftCode),
    locationBlock: getWorkLocationBlock(locationKey),
    taxCode: employee.taxCode,
  };
}
