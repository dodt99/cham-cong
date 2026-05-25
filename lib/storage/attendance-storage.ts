import { EMPLOYEES } from "@/lib/constants/employees";
import {
  type AttendanceStore,
  createEmptyEmployeeRow,
  type WeekSheet,
} from "@/lib/types/attendance";

const STORAGE_KEY = "cham-cong-v1";

export function createEmptyWeekSheet(weekStart: string): WeekSheet {
  const rows: WeekSheet["rows"] = {};
  for (const emp of EMPLOYEES) {
    rows[emp.id] = createEmptyEmployeeRow();
  }
  return { weekStart, rows };
}

export function createEmptyStore(): AttendanceStore {
  return { sheets: {}, activeWeekStart: null };
}

export function loadStore(): AttendanceStore {
  if (typeof window === "undefined") {
    return createEmptyStore();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyStore();
    const parsed = JSON.parse(raw) as AttendanceStore;
    if (!parsed.sheets || typeof parsed.sheets !== "object") {
      return createEmptyStore();
    }
    return {
      sheets: parsed.sheets,
      activeWeekStart: parsed.activeWeekStart ?? null,
    };
  } catch {
    return createEmptyStore();
  }
}

export function saveStore(store: AttendanceStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
