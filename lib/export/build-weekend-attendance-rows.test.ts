import { EMPLOYEES } from "@/lib/constants/employees";
import {
  buildWeekendAttendanceRows,
  buildWeekendRowForEmployeeDay,
} from "@/lib/export/build-weekend-attendance-rows";
import {
  WEEKEND_JOB_DESCRIPTION,
  WEEKEND_JOB_TITLE,
} from "@/lib/export/weekend-constants";
import {
  createEmptyDayEntry,
  createEmptyEmployeeRow,
  type DayKey,
  type WeekSheet,
} from "@/lib/types/attendance";
import { describe, expect, it } from "vitest";

const WEEK_START = "2026-05-04";
const LOC_TANG1 = "K1.1TD#0";

type DayInput = {
  shiftCode: string | null;
  locationKey?: string | null;
};

function makeRow(days: Partial<Record<DayKey, DayInput>>) {
  const row = createEmptyEmployeeRow();
  for (const [day, entry] of Object.entries(days) as [DayKey, DayInput][]) {
    row.days[day] = {
      ...createEmptyDayEntry(),
      shiftCode: entry.shiftCode,
      locationKey: entry.locationKey ?? null,
      extraEvening: false,
      eveningLocationKey: null,
    };
  }
  return row;
}

function makeSheet(
  rows: Record<string, ReturnType<typeof makeRow>>,
): WeekSheet {
  return { weekStart: WEEK_START, rows };
}

describe("buildWeekendAttendanceRows", () => {
  it("skips days without a shift", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        sat: { shiftCode: "K01" },
        sun: { shiftCode: null },
      }),
    });

    const rows = buildWeekendAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].dayKey).toBe("sat");
  });

  it("emits two rows when employee works both Sat and Sun", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        sat: { shiftCode: "K01" },
        sun: { shiftCode: "K03" },
      }),
    });

    const rows = buildWeekendAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.dayKey)).toEqual(["sat", "sun"]);
  });

  it("uses shift assigned times from weekend shift K01", () => {
    const row = buildWeekendRowForEmployeeDay(
      WEEK_START,
      EMPLOYEES[0].id,
      "sat",
      "K01",
    );
    expect(row?.assignedStart).toEqual({ h: 5, m: 0 });
    expect(row?.assignedEnd).toEqual({ h: 14, m: 30 });
  });

  it("uses fixed job title and description", () => {
    const row = buildWeekendRowForEmployeeDay(
      WEEK_START,
      EMPLOYEES[0].id,
      "sat",
      "K01",
    );
    expect(row?.jobTitle).toBe(WEEKEND_JOB_TITLE);
    expect(row?.jobDescription).toBe(WEEKEND_JOB_DESCRIPTION);
    expect(row?.locationBlock).toBeNull();
  });

  it("maps location key to block like early export", () => {
    const row = buildWeekendRowForEmployeeDay(
      WEEK_START,
      EMPLOYEES[0].id,
      "sat",
      "K01",
      LOC_TANG1,
    );
    expect(row?.locationBlock).toBe("Tầng 1");
  });

  it("resolves location block from sheet day entry", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        sat: { shiftCode: "K01", locationKey: LOC_TANG1 },
      }),
    });

    const rows = buildWeekendAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows[0].locationBlock).toBe("Tầng 1");
  });

  it("uses manager employee with same fixed titles", () => {
    const row = buildWeekendRowForEmployeeDay(
      WEEK_START,
      "23160",
      "sun",
      "K13",
    );
    expect(row?.jobTitle).toBe(WEEKEND_JOB_TITLE);
    expect(row?.jobDescription).toBe(WEEKEND_JOB_DESCRIPTION);
  });

  it("orders rows by EMPLOYEES then sat before sun", () => {
    const id0 = EMPLOYEES[0].id;
    const id1 = EMPLOYEES[1].id;
    const sheet = makeSheet({
      [id0]: makeRow({ sun: { shiftCode: "K01" } }),
      [id1]: makeRow({ sat: { shiftCode: "K01" } }),
    });

    const rows = buildWeekendAttendanceRows(sheet);
    expect(rows.map((r) => `${r.employeeId}-${r.dayKey}`)).toEqual([
      `${id0}-sun`,
      `${id1}-sat`,
    ]);
  });
});
