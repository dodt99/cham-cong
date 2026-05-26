import { EMPLOYEES } from "@/lib/constants/employees";
import {
  AFTERNOON_OFF_LABEL,
  isAfternoonOffShift,
} from "@/lib/constants/shifts";
import { getWorkLocationCode } from "@/lib/constants/work-locations";
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
  locationCode: string | null;
  note: string | null;
};

type DaySlice = {
  date: string;
  shiftCode: string | null;
  locationKey: string | null;
  extraEvening: boolean;
  eveningLocationKey: string | null;
};

type SegmentKind = "work" | "off" | "evening";

type Segment = {
  fromDate: string;
  toDate: string;
  shiftLabel: string;
  locationCode: string | null;
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
    locationKey: row.days[day].locationKey,
    extraEvening: row.days[day].extraEvening,
    eveningLocationKey: row.days[day].eveningLocationKey,
  }));
}

function buildConsecutiveSegments(
  days: DaySlice[],
  isActive: (day: DaySlice) => boolean,
  createSegment: (day: DaySlice) => Pick<Segment, "shiftLabel" | "locationCode">,
  canMergeWithDay: (current: Segment, day: DaySlice) => boolean,
  kind: SegmentKind,
): Segment[] {
  const segments: Segment[] = [];
  let current: Segment | null = null;

  for (const day of days) {
    if (!isActive(day)) {
      current = null;
      continue;
    }

    const { shiftLabel, locationCode } = createSegment(day);

    if (
      current &&
      canMergeWithDay(current, day) &&
      isAdjacentDay(current.toDate, day.date)
    ) {
      current.toDate = day.date;
      continue;
    }

    current = {
      fromDate: day.date,
      toDate: day.date,
      shiftLabel,
      locationCode,
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
    (day) => ({
      shiftLabel: day.shiftCode!,
      locationCode: getWorkLocationCode(day.locationKey),
    }),
    (current, day) =>
      current.shiftLabel === day.shiftCode &&
      current.locationCode === getWorkLocationCode(day.locationKey),
    "work",
  );
}

function buildOffSegments(days: DaySlice[]): Segment[] {
  return buildConsecutiveSegments(
    days,
    (day) => day.shiftCode === null,
    () => ({ shiftLabel: OFF_LABEL, locationCode: null }),
    () => true,
    "off",
  );
}

function buildEveningSegments(days: DaySlice[]): Segment[] {
  return buildConsecutiveSegments(
    days,
    (day) => day.extraEvening,
    (day) => ({
      shiftLabel: EVENING_SHIFT_CODE,
      locationCode: getWorkLocationCode(day.eveningLocationKey),
    }),
    (current, day) =>
      current.locationCode === getWorkLocationCode(day.eveningLocationKey),
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
        locationCode: getWorkLocationCode(day.locationKey),
        kind: "work",
      });
    } else {
      segments.push({
        fromDate: day.date,
        toDate: day.date,
        shiftLabel: OFF_LABEL,
        locationCode: null,
        kind: "off",
      });
    }

    if (day.extraEvening) {
      segments.push({
        fromDate: day.date,
        toDate: day.date,
        shiftLabel: EVENING_SHIFT_CODE,
        locationCode: getWorkLocationCode(day.eveningLocationKey),
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
        locationCode: segment.locationCode,
        note: isAfternoonOffShift(segment.shiftLabel)
          ? AFTERNOON_OFF_LABEL
          : null,
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
    Record<
      DayKey,
      {
        shiftCode: string | null;
        locationKey?: string | null;
        extraEvening?: boolean;
        eveningLocationKey?: string | null;
      }
    >
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
