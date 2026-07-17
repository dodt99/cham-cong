import { EMPLOYEES } from "@/lib/constants/employees";
import {
  getShiftByCode,
  isAfternoonOffShift,
  type ShiftTime,
} from "@/lib/constants/shifts";
import { getWorkLocationBlock } from "@/lib/constants/work-locations";
import {
  EARLY_JOB_POSITION_DEFAULT,
  EARLY_JOB_POSITION_MANAGER,
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
  jobPosition: string;
  assignedStart: ShiftTime | null;
  assignedEnd: ShiftTime | null;
  jobTitle: string;
  locationBlock: string | null;
  taxCode: string;
  note: string | null;
};

const WEEKDAY_KEYS = DAY_KEYS.slice(0, 5);
const EARLY_EXCLUDED_SHIFT_CODES = new Set(["K18", "K39"]);

function getEarlyAssignedEnd(
  shiftCode: string,
  shift: ReturnType<typeof getShiftByCode>
): ShiftTime | null {
  if (isAfternoonOffShift(shiftCode)) return { h: 16, m: 30 }; // Nghỉ chiều nhưng vẫn tính ca được giao đến 16h30
  return shift?.assignedEnd ?? null;
}

export function getEarlyJobPosition(employeeId: string): string {
  return employeeId === EARLY_MANAGER_EMPLOYEE_ID
    ? EARLY_JOB_POSITION_MANAGER
    : EARLY_JOB_POSITION_DEFAULT;
}

export function getEarlyJobTitle(employeeId: string): string {
  return employeeId === EARLY_MANAGER_EMPLOYEE_ID
    ? EARLY_JOB_TITLE_MANAGER
    : EARLY_JOB_TITLE_DEFAULT;
}

export function buildEarlyAttendanceRows(
  sheet: WeekSheet
): EarlyAttendanceRow[] {
  const rows: EarlyAttendanceRow[] = [];

  for (const employee of EMPLOYEES) {
    const weekRow = sheet.rows[employee.id] ?? createEmptyEmployeeRow();

    for (const day of WEEKDAY_KEYS) {
      const entry = weekRow.days[day];
      if (entry.shiftCode === null) continue;
      if (EARLY_EXCLUDED_SHIFT_CODES.has(entry.shiftCode)) continue;
      if (entry.locationKey === "NORMAL-CS2") continue;

      const shift = getShiftByCode(entry.shiftCode);

      rows.push({
        workDate: getDayDate(sheet.weekStart, day),
        employeeId: employee.id,
        fullName: employee.fullName,
        jobPosition: getEarlyJobPosition(employee.id),
        assignedStart: shift?.assignedStart ?? null,
        assignedEnd: getEarlyAssignedEnd(entry.shiftCode, shift),
        jobTitle: getEarlyJobTitle(employee.id),
        locationBlock: getWorkLocationBlock(entry.locationKey),
        taxCode: employee.taxCode,
        note: isAfternoonOffShift(entry.shiftCode) ? "Nghỉ chiều" : null,
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
  locationKey: string | null
): EarlyAttendanceRow | null {
  if (shiftCode === null) return null;
  if (EARLY_EXCLUDED_SHIFT_CODES.has(shiftCode)) return null;

  const employee = EMPLOYEES.find((e) => e.id === employeeId);
  if (!employee) return null;

  const shift = getShiftByCode(shiftCode);

  return {
    workDate: getDayDate(weekStart, day),
    employeeId: employee.id,
    fullName: employee.fullName,
    jobPosition: getEarlyJobPosition(employee.id),
    assignedStart: shift?.assignedStart ?? null,
    assignedEnd: getEarlyAssignedEnd(shiftCode, shift),
    jobTitle: getEarlyJobTitle(employee.id),
    locationBlock: getWorkLocationBlock(locationKey),
    taxCode: employee.taxCode,
    note: isAfternoonOffShift(shiftCode) ? "Nghỉ chiều" : null,
  };
}
