import { EMPLOYEES } from "@/lib/constants/employees";
import { EVENING_SHIFT_CODE, OFF_LABEL } from "@/lib/export/constants";
import {
  createEmptyEmployeeRow,
  DAY_KEYS,
  type DayKey,
  type EmployeeWeekRow,
  type WeekSheet,
} from "@/lib/types/attendance";
import { getDayDate } from "@/lib/utils/week";

export type AttendanceExportRow = {
  employeeId: string;
  fullName: string;
  fromDate: string;
  toDate: string;
  shiftLabel: string;
};

type DaySlice = {
  date: string;
  shiftCode: string | null;
  extraEvening: boolean;
};

type SegmentKind = "work" | "off" | "evening";

type Segment = {
  fromDate: string;
  toDate: string;
  shiftLabel: string;
  kind: SegmentKind;
};

const KIND_SORT_ORDER: Record<SegmentKind, number> = {
  work: 0,
  off: 1,
  evening: 2,
};

/** T2–T6: merge consecutive days; T7/CN: one export row per day */
const WEEKDAY_SLICE_COUNT = 5;

function buildDaySlices(weekStart: string, row: EmployeeWeekRow): DaySlice[] {
  return DAY_KEYS.map((day) => ({
    date: getDayDate(weekStart, day),
    shiftCode: row.days[day].shiftCode,
    extraEvening: row.days[day].extraEvening,
  }));
}

function buildConsecutiveSegments(
  days: DaySlice[],
  isActive: (day: DaySlice) => boolean,
  getLabel: (day: DaySlice) => string,
  canMerge: (prevLabel: string, nextLabel: string) => boolean,
  kind: SegmentKind,
): Segment[] {
  const segments: Segment[] = [];
  let current: Segment | null = null;

  for (const day of days) {
    if (!isActive(day)) {
      current = null;
      continue;
    }

    const label = getLabel(day);

    if (
      current &&
      canMerge(current.shiftLabel, label) &&
      isAdjacentDay(current.toDate, day.date)
    ) {
      current.toDate = day.date;
      continue;
    }

    current = {
      fromDate: day.date,
      toDate: day.date,
      shiftLabel: label,
      kind,
    };
    segments.push(current);
  }

  return segments;
}

function isAdjacentDay(prevIso: string, nextIso: string): boolean {
  const prev = parseDateParts(prevIso);
  const next = parseDateParts(nextIso);
  const prevMs = Date.UTC(prev.y, prev.m - 1, prev.d);
  const nextMs = Date.UTC(next.y, next.m - 1, next.d);
  return nextMs - prevMs === 24 * 60 * 60 * 1000;
}

function parseDateParts(isoDate: string): { y: number; m: number; d: number } {
  const [y, m, d] = isoDate.split("-").map(Number);
  return { y, m, d };
}

function buildWorkSegments(days: DaySlice[]): Segment[] {
  return buildConsecutiveSegments(
    days,
    (day) => day.shiftCode !== null,
    (day) => day.shiftCode!,
    (prev, next) => prev === next,
    "work",
  );
}

function buildOffSegments(days: DaySlice[]): Segment[] {
  return buildConsecutiveSegments(
    days,
    (day) => day.shiftCode === null,
    () => OFF_LABEL,
    () => true,
    "off",
  );
}

function buildEveningSegments(days: DaySlice[]): Segment[] {
  return buildConsecutiveSegments(
    days,
    (day) => day.extraEvening,
    () => EVENING_SHIFT_CODE,
    () => true,
    "evening",
  );
}

function buildWeekendSegments(days: DaySlice[]): Segment[] {
  const segments: Segment[] = [];

  for (const day of days) {
    if (day.shiftCode !== null) {
      segments.push({
        fromDate: day.date,
        toDate: day.date,
        shiftLabel: day.shiftCode,
        kind: "work",
      });
    } else {
      segments.push({
        fromDate: day.date,
        toDate: day.date,
        shiftLabel: OFF_LABEL,
        kind: "off",
      });
    }

    if (day.extraEvening) {
      segments.push({
        fromDate: day.date,
        toDate: day.date,
        shiftLabel: EVENING_SHIFT_CODE,
        kind: "evening",
      });
    }
  }

  return segments;
}

function sortSegments(segments: Segment[]): Segment[] {
  return [...segments].sort((a, b) => {
    if (a.fromDate !== b.fromDate) {
      return a.fromDate.localeCompare(b.fromDate);
    }
    return KIND_SORT_ORDER[a.kind] - KIND_SORT_ORDER[b.kind];
  });
}

function buildEmployeeSegments(
  weekStart: string,
  row: EmployeeWeekRow,
): Segment[] {
  const days = buildDaySlices(weekStart, row);
  const weekdays = days.slice(0, WEEKDAY_SLICE_COUNT);
  const weekend = days.slice(WEEKDAY_SLICE_COUNT);

  const segments = [
    ...buildWorkSegments(weekdays),
    ...buildOffSegments(weekdays),
    ...buildEveningSegments(weekdays),
    ...buildWeekendSegments(weekend),
  ];
  return sortSegments(segments);
}

export function buildAttendanceRows(sheet: WeekSheet): AttendanceExportRow[] {
  const rows: AttendanceExportRow[] = [];

  for (const employee of EMPLOYEES) {
    const weekRow = sheet.rows[employee.id] ?? createEmptyEmployeeRow();
    const segments = buildEmployeeSegments(sheet.weekStart, weekRow);

    for (const segment of segments) {
      rows.push({
        employeeId: employee.id,
        fullName: employee.fullName,
        fromDate: segment.fromDate,
        toDate: segment.toDate,
        shiftLabel: segment.shiftLabel,
      });
    }
  }

  return rows;
}

/** @internal Exported for tests */
export function buildEmployeeSegmentsForTest(
  weekStart: string,
  row: EmployeeWeekRow,
): Segment[] {
  return buildEmployeeSegments(weekStart, row);
}

/** @internal Exported for tests */
export function buildDaySlicesForTest(
  weekStart: string,
  days: Partial<
    Record<DayKey, { shiftCode: string | null; extraEvening: boolean }>
  >,
): DaySlice[] {
  const row = createEmptyEmployeeRow();
  for (const day of DAY_KEYS) {
    if (days[day]) {
      row.days[day] = { ...row.days[day], ...days[day] };
    }
  }
  return buildDaySlices(weekStart, row);
}
