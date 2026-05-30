import { DEFAULT_OFF_TYPE } from "@/lib/constants/off-types";
import {
  createEmptyDayEntry,
  createEmptyEmployeeRow,
  DAY_KEYS,
  type AttendanceStore,
  type DayEntry,
  type EmployeeWeekRow,
  type WeekSheet,
} from "@/lib/types/attendance";

type LegacyPayload = {
  state?: AttendanceStore;
  sheets?: Record<string, WeekSheet>;
  activeWeekStart?: string | null;
  version?: number;
};

type LegacyDayEntry = Partial<DayEntry> & {
  shiftCode: string | null;
  locationKey?: string | null;
  extraEvening?: boolean;
  eveningLocationKey?: string | null;
};

type LegacyEmployeeWeekRow = Partial<EmployeeWeekRow> & {
  defaultShiftCode?: string | null;
  defaultLocationKey?: string | null;
  days: Record<string, LegacyDayEntry>;
};

type LegacyWeekSheet = {
  weekStart: string;
  rows: Record<string, LegacyEmployeeWeekRow>;
};

function migrateDayEntry(entry: LegacyDayEntry): DayEntry {
  const base = createEmptyDayEntry();
  const shiftCode = entry.shiftCode ?? null;

  return {
    ...base,
    ...entry,
    shiftCode,
    offType:
      shiftCode === null ? (entry.offType ?? DEFAULT_OFF_TYPE) : null,
    locationKey: entry.locationKey ?? null,
    extraEvening: entry.extraEvening ?? false,
    eveningLocationKey: entry.eveningLocationKey ?? null,
  };
}

function migrateEmployeeRow(row: LegacyEmployeeWeekRow): EmployeeWeekRow {
  const base = createEmptyEmployeeRow();
  const defaultShiftCode = row.defaultShiftCode ?? null;
  const days = { ...base.days };

  for (const day of DAY_KEYS) {
    days[day] = row.days?.[day]
      ? migrateDayEntry(row.days[day])
      : base.days[day];
  }

  return {
    ...base,
    defaultShiftCode,
    defaultOffType:
      defaultShiftCode === null
        ? (row.defaultOffType ?? DEFAULT_OFF_TYPE)
        : null,
    defaultLocationKey: row.defaultLocationKey ?? null,
    days,
  };
}

function migrateWeekSheet(sheet: LegacyWeekSheet): WeekSheet {
  const rows: Record<string, EmployeeWeekRow> = {};

  for (const [employeeId, row] of Object.entries(sheet.rows ?? {})) {
    rows[employeeId] = migrateEmployeeRow(row);
  }

  return {
    weekStart: sheet.weekStart,
    rows,
  };
}

function migrateStore(store: AttendanceStore): AttendanceStore {
  const sheets: Record<string, WeekSheet> = {};

  for (const [weekStart, sheet] of Object.entries(store.sheets ?? {})) {
    sheets[weekStart] = migrateWeekSheet(sheet as LegacyWeekSheet);
  }

  return {
    sheets,
    activeWeekStart: store.activeWeekStart ?? null,
  };
}

export function normalizePersistedPayload(
  raw: string | null,
): AttendanceStore | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LegacyPayload;
    if (parsed.state) {
      return migrateStore({
        sheets: parsed.state.sheets ?? {},
        activeWeekStart: parsed.state.activeWeekStart ?? null,
      });
    }
    if (parsed.sheets && typeof parsed.sheets === "object") {
      return migrateStore({
        sheets: parsed.sheets,
        activeWeekStart: parsed.activeWeekStart ?? null,
      });
    }
  } catch {
    return null;
  }
  return null;
}

export function toPersistJson(state: AttendanceStore): string {
  return JSON.stringify({
    state: {
      sheets: state.sheets,
      activeWeekStart: state.activeWeekStart,
    },
    version: 0,
  });
}
