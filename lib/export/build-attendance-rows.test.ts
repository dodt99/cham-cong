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

function makeRow(
  days: Partial<
    Record<DayKey, { shiftCode: string | null; extraEvening?: boolean }>
  >,
): EmployeeWeekRow {
  const row = createEmptyEmployeeRow();
  for (const [day, entry] of Object.entries(days) as [
    DayKey,
    { shiftCode: string | null; extraEvening?: boolean },
  ][]) {
    row.days[day] = {
      ...createEmptyDayEntry(),
      shiftCode: entry.shiftCode,
      extraEvening: entry.extraEvening ?? false,
    };
  }
  return row;
}

function segmentLabels(
  row: EmployeeWeekRow,
): { from: string; to: string; shift: string }[] {
  return buildEmployeeSegmentsForTest(WEEK_START, row).map((s) => ({
    from: s.fromDate,
    to: s.toDate,
    shift: s.shiftLabel,
  }));
}

describe("buildEmployeeSegments", () => {
  it("merges full week with same shift", () => {
    const row = makeRow({
      mon: { shiftCode: "K07" },
      tue: { shiftCode: "K07" },
      wed: { shiftCode: "K07" },
      thu: { shiftCode: "K07" },
      fri: { shiftCode: "K07" },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-22", shift: "K07" },
    ]);
  });

  it("splits off day before work week", () => {
    const row = makeRow({
      mon: { shiftCode: null },
      tue: { shiftCode: "K07" },
      wed: { shiftCode: "K07" },
      thu: { shiftCode: "K07" },
      fri: { shiftCode: "K07" },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-18", shift: OFF_LABEL },
      { from: "2026-05-19", to: "2026-05-22", shift: "K07" },
    ]);
  });

  it("merges consecutive off days", () => {
    const row = makeRow({
      mon: { shiftCode: "K07" },
      tue: { shiftCode: null },
      wed: { shiftCode: null },
      thu: { shiftCode: "K07" },
      fri: { shiftCode: "K07" },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-18", shift: "K07" },
      { from: "2026-05-19", to: "2026-05-20", shift: OFF_LABEL },
      { from: "2026-05-21", to: "2026-05-22", shift: "K07" },
    ]);
  });

  it("splits when shift changes mid-week", () => {
    const row = makeRow({
      mon: { shiftCode: "K07" },
      tue: { shiftCode: "K07" },
      wed: { shiftCode: "K07" },
      thu: { shiftCode: "K02" },
      fri: { shiftCode: "K02" },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-20", shift: "K07" },
      { from: "2026-05-21", to: "2026-05-22", shift: "K02" },
    ]);
  });

  it("adds merged evening segment", () => {
    const row = makeRow({
      mon: { shiftCode: "K07" },
      tue: { shiftCode: "K07" },
      wed: { shiftCode: "K07" },
      thu: { shiftCode: "K07", extraEvening: true },
      fri: { shiftCode: "K07", extraEvening: true },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-22", shift: "K07" },
      { from: "2026-05-21", to: "2026-05-22", shift: EVENING_SHIFT_CODE },
    ]);
  });

  it("exports evening on off day", () => {
    const row = makeRow({
      mon: { shiftCode: null, extraEvening: true },
      tue: { shiftCode: "K07" },
      wed: { shiftCode: "K07" },
      thu: { shiftCode: "K07" },
      fri: { shiftCode: "K07" },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-18", shift: OFF_LABEL },
      { from: "2026-05-18", to: "2026-05-18", shift: EVENING_SHIFT_CODE },
      { from: "2026-05-19", to: "2026-05-22", shift: "K07" },
    ]);
  });

  it("treats full week off as one row", () => {
    const row = createEmptyEmployeeRow();
    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-22", shift: OFF_LABEL },
    ]);
  });

  it("treats half-day shift as work not off", () => {
    const row = makeRow({
      mon: { shiftCode: "K35" },
      tue: { shiftCode: "K35" },
      wed: { shiftCode: "K35" },
      thu: { shiftCode: "K35" },
      fri: { shiftCode: "K35" },
    });

    expect(segmentLabels(row)).toEqual([
      { from: "2026-05-18", to: "2026-05-22", shift: "K35" },
    ]);
  });

  it("sorts work before evening on same day", () => {
    const row = makeRow({
      mon: { shiftCode: "K07", extraEvening: true },
      tue: { shiftCode: "K02" },
      wed: { shiftCode: "K02" },
      thu: { shiftCode: "K02" },
      fri: { shiftCode: "K02" },
    });

    const labels = segmentLabels(row);
    expect(labels[0]).toEqual({
      from: "2026-05-18",
      to: "2026-05-18",
      shift: "K07",
    });
    expect(labels[1]).toEqual({
      from: "2026-05-18",
      to: "2026-05-18",
      shift: EVENING_SHIFT_CODE,
    });
    expect(labels[2]).toEqual({
      from: "2026-05-19",
      to: "2026-05-22",
      shift: "K02",
    });
  });
});

describe("buildAttendanceRows", () => {
  it("includes one off row per empty employee in full sheet", () => {
    const sheet: WeekSheet = {
      weekStart: WEEK_START,
      rows: {},
    };

    const rows = buildAttendanceRows(sheet);
    const offRows = rows.filter((r) => r.shiftLabel === OFF_LABEL);
    expect(offRows.length).toBeGreaterThan(0);
    expect(
      offRows.every(
        (r) => r.fromDate === "2026-05-18" && r.toDate === "2026-05-22",
      ),
    ).toBe(true);
  });
});
