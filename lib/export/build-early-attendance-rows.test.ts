import { EMPLOYEES } from "@/lib/constants/employees";
import {
  EARLY_JOB_TITLE_DEFAULT,
  EARLY_JOB_TITLE_MANAGER,
  EARLY_MANAGER_EMPLOYEE_ID,
} from "@/lib/export/early-constants";
import {
  buildEarlyAttendanceRows,
  getEarlyJobTitle,
} from "@/lib/export/build-early-attendance-rows";
import {
  createEmptyDayEntry,
  createEmptyEmployeeRow,
  type DayKey,
  type WeekSheet,
} from "@/lib/types/attendance";
import { describe, expect, it } from "vitest";

const WEEK_START = "2026-05-18";
const LOC_TANG1 = "K1.1TD#NORMAL";
const LOC_HAM = "K1.BTD#NORMAL";

type DayInput = {
  shiftCode: string | null;
  locationKey?: string | null;
  extraEvening?: boolean;
};

function makeRow(days: Partial<Record<DayKey, DayInput>>) {
  const row = createEmptyEmployeeRow();
  for (const [day, entry] of Object.entries(days) as [DayKey, DayInput][]) {
    row.days[day] = {
      ...createEmptyDayEntry(),
      shiftCode: entry.shiftCode,
      locationKey: entry.locationKey ?? null,
      extraEvening: entry.extraEvening ?? false,
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

describe("getEarlyJobTitle", () => {
  it("uses default job title", () => {
    expect(getEarlyJobTitle("24662", "K07")).toBe(EARLY_JOB_TITLE_DEFAULT);
  });

  it("uses manager title for employee 23160", () => {
    expect(getEarlyJobTitle(EARLY_MANAGER_EMPLOYEE_ID, "K07")).toBe(
      EARLY_JOB_TITLE_MANAGER,
    );
  });

  it("appends afternoon-off suffix", () => {
    expect(getEarlyJobTitle("24662", "K35")).toBe(
      `${EARLY_JOB_TITLE_DEFAULT} (Nghỉ chiều)`,
    );
    expect(getEarlyJobTitle(EARLY_MANAGER_EMPLOYEE_ID, "K35")).toBe(
      `${EARLY_JOB_TITLE_MANAGER} (Nghỉ chiều)`,
    );
  });
});

describe("buildEarlyAttendanceRows", () => {
  it("skips off days (null shift)", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        mon: { shiftCode: "K07", locationKey: LOC_TANG1 },
        tue: { shiftCode: null },
      }),
    });

    const rows = buildEarlyAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].workDate).toBe("2026-05-18");
  });

  it("includes afternoon-off shifts with note in job title", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        wed: { shiftCode: "K35", locationKey: LOC_HAM },
      }),
    });

    const rows = buildEarlyAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows[0].jobTitle).toBe(`${EARLY_JOB_TITLE_DEFAULT} (Nghỉ chiều)`);
    expect(rows[0].assignedStart).toEqual({ h: 5, m: 0 });
    expect(rows[0].assignedEnd).toBeNull();
    expect(rows[0].locationBlock).toBe("Tầng B1");
  });

  it("keeps start time but omits end time for afternoon-off codes", () => {
    const firstId = EMPLOYEES[0].id;
    const cases = [
      { code: "K35", start: { h: 5, m: 0 } },
      { code: "K36", start: { h: 5, m: 30 } },
      { code: "K37", start: { h: 6, m: 0 } },
      { code: "K39", start: { h: 7, m: 30 } },
    ] as const;

    for (const { code, start } of cases) {
      const sheet = makeSheet({
        [firstId]: makeRow({
          mon: { shiftCode: code, locationKey: LOC_TANG1 },
        }),
      });
      const row = buildEarlyAttendanceRows(sheet).find(
        (r) => r.employeeId === firstId,
      );
      expect(row?.assignedStart, code).toEqual(start);
      expect(row?.assignedEnd, code).toBeNull();
    }
  });

  it("does not include evening-only days without day shift", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        thu: { shiftCode: null, extraEvening: true },
      }),
    });

    const rows = buildEarlyAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows).toHaveLength(0);
  });

  it("sorts by employee list order then Mon–Fri", () => {
    const idA = EMPLOYEES[0].id;
    const idB = EMPLOYEES[1].id;
    const sheet = makeSheet({
      [idA]: makeRow({
        fri: { shiftCode: "K07", locationKey: LOC_TANG1 },
      }),
      [idB]: makeRow({
        mon: { shiftCode: "K07", locationKey: LOC_TANG1 },
      }),
    });

    const rows = buildEarlyAttendanceRows(sheet);
    const ids = rows.map((r) => r.employeeId);
    const idxA = ids.indexOf(idA);
    const idxB = ids.indexOf(idB);
    expect(idxA).toBeLessThan(idxB);
    expect(rows[idxA].workDate).toBe("2026-05-22");
    expect(rows[idxB].workDate).toBe("2026-05-18");
  });

  it("parses shift times from shift name", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        mon: { shiftCode: "K07", locationKey: LOC_TANG1 },
      }),
    });

    const row = buildEarlyAttendanceRows(sheet).find(
      (r) => r.employeeId === firstId,
    );
    expect(row?.assignedStart).toEqual({ h: 6, m: 0 });
    expect(row?.assignedEnd).toEqual({ h: 16, m: 30 });
  });
});
