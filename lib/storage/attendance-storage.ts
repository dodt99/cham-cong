import { EMPLOYEES_EVENING_AND_WEEKEND } from "@/lib/constants/employees";
import {
  type AttendanceStore,
  createEmptyEmployeeRow,
  type WeekSheet,
} from "@/lib/types/attendance";

export const STORAGE_KEY = "cham-cong-v1";

export function createEmptyWeekSheet(weekStart: string): WeekSheet {
  const rows: WeekSheet["rows"] = {};
  for (const emp of EMPLOYEES_EVENING_AND_WEEKEND) {
    rows[emp.id] = createEmptyEmployeeRow();
  }
  return { weekStart, rows };
}

export function createEmptyStore(): AttendanceStore {
  return { sheets: {}, activeWeekStart: null };
}

