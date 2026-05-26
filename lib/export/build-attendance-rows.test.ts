import { EMPLOYEES } from "@/lib/constants/employees";
import { describe, expect, it } from "vitest";
import {
  buildAttendanceRows,
  buildEmployeeSegmentsForTest,
} from "@/lib/export/build-attendance-rows";
import { EVENING_SHIFT_CODE, OFF_LABEL } from "@/lib/export/constants";
import {
  createEmptyEmployeeRow,
  createEmptyDayEntry,
  type DayKey,
  type EmployeeWeekRow,
  type WeekSheet,
} from "@/lib/types/attendance";

const WEEK_START = "2026-05-18";

const LOC_TANG1 = "K1.1TD#0";
const LOC_SIEU_AM = "K1.2TDSA#1";
const LOC_CA_TOI_T3 = "K1.P321#8";

/** Default weekend when tests only set T2–T6 (one row per day) */
const SAT_OFF = { from: "2026-05-23", to: "2026-05-23", shift: OFF_LABEL };
const SUN_OFF = { from: "2026-05-24", to: "2026-05-24", shift: OFF_LABEL };

type DayInput = {
  shiftCode: string | null;
  locationKey?: string | null;
  extraEvening?: boolean;
  eveningLocationKey?: string | null;
};

function makeRow(days: Partial<Record<DayKey, DayInput>>): EmployeeWeekRow {
  const row = createEmptyEmployeeRow();
  for (const [day, entry] of Object.entries(days) as [DayKey, DayInput][]) {
    row.days[day] = {
      ...createEmptyDayEntry(),
      shiftCode: entry.shiftCode,
      locationKey: entry.locationKey ?? null,
      extraEvening: entry.extraEvening ?? false,
      eveningLocationKey: entry.eveningLocationKey ?? null,
    };
  }
  return row;
}

function segmentLabels(
  row: EmployeeWeekRow,
): { from: string; to: string; shift: string; location: string | null }[] {
  return buildEmployeeSegmentsForTest(WEEK_START, row).map((s) => ({
    from: s.fromDate,
    to: s.toDate,
    shift: s.shiftLabel,
    location: s.locationCode,
  }));
}

describe("buildEmployeeSegments", () => {
  it("merges full week with same shift and location", () => {
    const row = makeRow({
      mon: { shiftCode: "K07", locationKey: LOC_TANG1 },
      tue: { shiftCode: "K07", locationKey: LOC_TANG1 },
      wed: { shiftCode: "K07", locationKey: LOC_TANG1 },
      thu: { shiftCode: "K07", locationKey: LOC_TANG1 },
      fri: { shiftCode: "K07", locationKey: LOC_TANG1 },
    });

    expect(segmentLabels(row)).toEqual([
      {
        from: "2026-05-18",
        to: "2026-05-22",
        shift: "K07",
        location: "K1.1TD",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("splits when same shift but different location mid-week", () => {
    const row = makeRow({
      mon: { shiftCode: "K07", locationKey: LOC_TANG1 },
      tue: { shiftCode: "K07", locationKey: LOC_TANG1 },
      wed: { shiftCode: "K07", locationKey: LOC_TANG1 },
      thu: { shiftCode: "K07", locationKey: LOC_SIEU_AM },
      fri: { shiftCode: "K07", locationKey: LOC_SIEU_AM },
    });

    expect(segmentLabels(row)).toEqual([
      {
        from: "2026-05-18",
        to: "2026-05-20",
        shift: "K07",
        location: "K1.1TD",
      },
      {
        from: "2026-05-21",
        to: "2026-05-22",
        shift: "K07",
        location: "K1.2TDSA",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("splits off day before work week", () => {
    const row = makeRow({
      mon: { shiftCode: null },
      tue: { shiftCode: "K07", locationKey: LOC_TANG1 },
      wed: { shiftCode: "K07", locationKey: LOC_TANG1 },
      thu: { shiftCode: "K07", locationKey: LOC_TANG1 },
      fri: { shiftCode: "K07", locationKey: LOC_TANG1 },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-18", shift: OFF_LABEL, location: null },
      {
        from: "2026-05-19",
        to: "2026-05-22",
        shift: "K07",
        location: "K1.1TD",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("merges consecutive off days", () => {
    const row = makeRow({
      mon: { shiftCode: "K07", locationKey: LOC_TANG1 },
      tue: { shiftCode: null },
      wed: { shiftCode: null },
      thu: { shiftCode: "K07", locationKey: LOC_TANG1 },
      fri: { shiftCode: "K07", locationKey: LOC_TANG1 },
    });

    expect(segmentLabels(row)).toEqual([
      {
        from: "2026-05-18",
        to: "2026-05-18",
        shift: "K07",
        location: "K1.1TD",
      },
      { from: "2026-05-19", to: "2026-05-20", shift: OFF_LABEL, location: null },
      {
        from: "2026-05-21",
        to: "2026-05-22",
        shift: "K07",
        location: "K1.1TD",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("splits when shift changes mid-week", () => {
    const row = makeRow({
      mon: { shiftCode: "K07", locationKey: LOC_TANG1 },
      tue: { shiftCode: "K07", locationKey: LOC_TANG1 },
      wed: { shiftCode: "K07", locationKey: LOC_TANG1 },
      thu: { shiftCode: "K02", locationKey: LOC_TANG1 },
      fri: { shiftCode: "K02", locationKey: LOC_TANG1 },
    });

    expect(segmentLabels(row)).toEqual([
      {
        from: "2026-05-18",
        to: "2026-05-20",
        shift: "K07",
        location: "K1.1TD",
      },
      {
        from: "2026-05-21",
        to: "2026-05-22",
        shift: "K02",
        location: "K1.1TD",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("adds merged evening segment with same location", () => {
    const row = makeRow({
      mon: { shiftCode: "K07", locationKey: LOC_TANG1 },
      tue: { shiftCode: "K07", locationKey: LOC_TANG1 },
      wed: { shiftCode: "K07", locationKey: LOC_TANG1 },
      thu: {
        shiftCode: "K07",
        locationKey: LOC_TANG1,
        extraEvening: true,
        eveningLocationKey: LOC_CA_TOI_T3,
      },
      fri: {
        shiftCode: "K07",
        locationKey: LOC_TANG1,
        extraEvening: true,
        eveningLocationKey: LOC_CA_TOI_T3,
      },
    });

    expect(segmentLabels(row)).toEqual([
      {
        from: "2026-05-18",
        to: "2026-05-22",
        shift: "K07",
        location: "K1.1TD",
      },
      {
        from: "2026-05-21",
        to: "2026-05-22",
        shift: EVENING_SHIFT_CODE,
        location: "K1.P321",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("splits evening when location changes", () => {
    const row = makeRow({
      mon: {
        shiftCode: null,
        extraEvening: true,
        eveningLocationKey: LOC_TANG1,
      },
      tue: {
        shiftCode: null,
        extraEvening: true,
        eveningLocationKey: LOC_SIEU_AM,
      },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-22", shift: OFF_LABEL, location: null },
      {
        from: "2026-05-18",
        to: "2026-05-18",
        shift: EVENING_SHIFT_CODE,
        location: "K1.1TD",
      },
      {
        from: "2026-05-19",
        to: "2026-05-19",
        shift: EVENING_SHIFT_CODE,
        location: "K1.2TDSA",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("exports evening on off day", () => {
    const row = makeRow({
      mon: {
        shiftCode: null,
        extraEvening: true,
        eveningLocationKey: LOC_CA_TOI_T3,
      },
      tue: { shiftCode: "K07", locationKey: LOC_TANG1 },
      wed: { shiftCode: "K07", locationKey: LOC_TANG1 },
      thu: { shiftCode: "K07", locationKey: LOC_TANG1 },
      fri: { shiftCode: "K07", locationKey: LOC_TANG1 },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-18", shift: OFF_LABEL, location: null },
      {
        from: "2026-05-18",
        to: "2026-05-18",
        shift: EVENING_SHIFT_CODE,
        location: "K1.P321",
      },
      {
        from: "2026-05-19",
        to: "2026-05-22",
        shift: "K07",
        location: "K1.1TD",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("treats full week off as merged weekdays and separate weekend rows", () => {
    const row = createEmptyEmployeeRow();
    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-22", shift: OFF_LABEL, location: null },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("does not merge weekend days with same shift", () => {
    const row = makeRow({
      sat: { shiftCode: "K01", locationKey: LOC_TANG1 },
      sun: { shiftCode: "K01", locationKey: LOC_TANG1 },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-22", shift: OFF_LABEL, location: null },
      {
        from: "2026-05-23",
        to: "2026-05-23",
        shift: "K01",
        location: "K1.1TD",
      },
      {
        from: "2026-05-24",
        to: "2026-05-24",
        shift: "K01",
        location: "K1.1TD",
      },
    ]);
  });

  it("treats half-day shift as work not off", () => {
    const row = makeRow({
      mon: { shiftCode: "K35", locationKey: LOC_TANG1 },
      tue: { shiftCode: "K35", locationKey: LOC_TANG1 },
      wed: { shiftCode: "K35", locationKey: LOC_TANG1 },
      thu: { shiftCode: "K35", locationKey: LOC_TANG1 },
      fri: { shiftCode: "K35", locationKey: LOC_TANG1 },
    });

    expect(segmentLabels(row)).toEqual([
      {
        from: "2026-05-18",
        to: "2026-05-22",
        shift: "K35",
        location: "K1.1TD",
      },
      { ...SAT_OFF, location: null },
      { ...SUN_OFF, location: null },
    ]);
  });

  it("sorts work before evening on same day", () => {
    const row = makeRow({
      mon: {
        shiftCode: "K07",
        locationKey: LOC_TANG1,
        extraEvening: true,
        eveningLocationKey: LOC_CA_TOI_T3,
      },
      tue: { shiftCode: "K02", locationKey: LOC_TANG1 },
      wed: { shiftCode: "K02", locationKey: LOC_TANG1 },
      thu: { shiftCode: "K02", locationKey: LOC_TANG1 },
      fri: { shiftCode: "K02", locationKey: LOC_TANG1 },
    });

    const labels = segmentLabels(row);
    expect(labels[0]).toEqual({
      from: "2026-05-18",
      to: "2026-05-18",
      shift: "K07",
      location: "K1.1TD",
    });
    expect(labels[1]).toEqual({
      from: "2026-05-18",
      to: "2026-05-18",
      shift: EVENING_SHIFT_CODE,
      location: "K1.P321",
    });
    expect(labels[2]).toEqual({
      from: "2026-05-19",
      to: "2026-05-22",
      shift: "K02",
      location: "K1.1TD",
    });
    expect(labels[3]).toEqual({ ...SAT_OFF, location: null });
    expect(labels[4]).toEqual({ ...SUN_OFF, location: null });
  });
});

describe("buildAttendanceRows", () => {
  it("sets column 10 to Nghỉ chiều for afternoon-off shifts", () => {
    const employeeId = EMPLOYEES[0]!.id;
    const sheet: WeekSheet = {
      weekStart: WEEK_START,
      rows: {
        [employeeId]: makeRow({
          mon: { shiftCode: "K35", locationKey: LOC_TANG1 },
          tue: { shiftCode: "K07", locationKey: LOC_TANG1 },
        }),
      },
    };

    const rows = buildAttendanceRows(sheet).filter(
      (r) => r.employeeId === employeeId,
    );
    const afternoonOff = rows.find((r) => r.shiftLabel === "K35");
    const regular = rows.find((r) => r.shiftLabel === "K07");

    expect(afternoonOff?.note).toBe("Nghỉ chiều");
    expect(regular?.note).toBeNull();
  });

  it("includes one off row per empty employee in full sheet", () => {
    const sheet: WeekSheet = {
      weekStart: WEEK_START,
      rows: {},
    };

    const rows = buildAttendanceRows(sheet);
    const offRows = rows.filter((r) => r.shiftLabel === OFF_LABEL);
    expect(offRows.length).toBeGreaterThan(0);
    const weekdayOff = offRows.filter(
      (r) => r.fromDate === "2026-05-18" && r.toDate === "2026-05-22",
    );
    expect(weekdayOff.length).toBeGreaterThan(0);
    expect(
      offRows.some(
        (r) => r.fromDate === "2026-05-23" && r.toDate === "2026-05-23",
      ),
    ).toBe(true);
    expect(
      offRows.some(
        (r) => r.fromDate === "2026-05-24" && r.toDate === "2026-05-24",
      ),
    ).toBe(true);
  });
});
