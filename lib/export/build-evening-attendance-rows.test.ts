import { EMPLOYEES } from "@/lib/constants/employees";
import {
  buildEveningAttendanceRows,
  buildEveningRowForEmployeeDay,
} from "@/lib/export/build-evening-attendance-rows";
import {
  EVENING_JOB_DESCRIPTION,
  EVENING_JOB_TITLE,
} from "@/lib/export/evening-constants";
import {
  createEmptyDayEntry,
  createEmptyEmployeeRow,
  type DayKey,
  type WeekSheet,
} from "@/lib/types/attendance";
import { describe, expect, it } from "vitest";

const WEEK_START = "2026-05-04";
const LOC_CA_TOI_T3 = "K1.P321#8";

type DayInput = {
  shiftCode?: string | null;
  extraEvening?: boolean;
  eveningLocationKey?: string | null;
};

function makeRow(days: Partial<Record<DayKey, DayInput>>) {
  const row = createEmptyEmployeeRow();
  for (const [day, entry] of Object.entries(days) as [DayKey, DayInput][]) {
    row.days[day] = {
      ...createEmptyDayEntry(),
      shiftCode: entry.shiftCode ?? null,
      locationKey: null,
      extraEvening: entry.extraEvening ?? false,
      eveningLocationKey: entry.eveningLocationKey ?? null,
    };
  }
  return row;
}

function makeSheet(
  rows: Record<string, ReturnType<typeof makeRow>>,
): WeekSheet {
  return { weekStart: WEEK_START, rows };
}

describe("buildEveningAttendanceRows", () => {
  it("skips days without extraEvening", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        mon: { extraEvening: true, eveningLocationKey: LOC_CA_TOI_T3 },
        tue: { extraEvening: false },
      }),
    });

    const rows = buildEveningAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].dayKey).toBe("mon");
  });

  it("includes evening on off day when extraEvening is set", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        wed: {
          shiftCode: null,
          extraEvening: true,
          eveningLocationKey: LOC_CA_TOI_T3,
        },
      }),
    });

    const rows = buildEveningAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].dayKey).toBe("wed");
  });

  it("emits multiple rows when employee works several evenings", () => {
    const firstId = EMPLOYEES[0].id;
    const sheet = makeSheet({
      [firstId]: makeRow({
        mon: { extraEvening: true },
        wed: { extraEvening: true },
      }),
    });

    const rows = buildEveningAttendanceRows(sheet).filter(
      (r) => r.employeeId === firstId,
    );
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.dayKey)).toEqual(["mon", "wed"]);
  });

  it("uses K15 shift times", () => {
    const row = buildEveningRowForEmployeeDay(
      WEEK_START,
      EMPLOYEES[0].id,
      "thu",
      true,
    );
    expect(row?.assignedStart).toEqual({ h: 16, m: 30 });
    expect(row?.assignedEnd).toEqual({ h: 20, m: 0 });
  });

  it("uses fixed job title and description", () => {
    const row = buildEveningRowForEmployeeDay(
      WEEK_START,
      EMPLOYEES[0].id,
      "fri",
      true,
    );
    expect(row?.jobTitle).toBe(EVENING_JOB_TITLE);
    expect(row?.jobDescription).toBe(EVENING_JOB_DESCRIPTION);
  });

  it("maps evening location key to block", () => {
    const row = buildEveningRowForEmployeeDay(
      WEEK_START,
      EMPLOYEES[0].id,
      "fri",
      true,
      LOC_CA_TOI_T3,
    );
    expect(row?.locationBlock).toBe("Tầng 3");
  });

  it("orders rows by day then employee", () => {
    const id0 = EMPLOYEES[0].id;
    const id1 = EMPLOYEES[1].id;
    const sheet = makeSheet({
      [id0]: makeRow({ tue: { extraEvening: true } }),
      [id1]: makeRow({ mon: { extraEvening: true } }),
    });

    const rows = buildEveningAttendanceRows(sheet);
    expect(rows.map((r) => `${r.dayKey}-${r.employeeId}`)).toEqual([
      `mon-${id1}`,
      `tue-${id0}`,
    ]);
  });

  it("uses same fixed titles for manager 23160", () => {
    const row = buildEveningRowForEmployeeDay(
      WEEK_START,
      "23160",
      "mon",
      true,
    );
    expect(row?.jobTitle).toBe(EVENING_JOB_TITLE);
    expect(row?.jobDescription).toBe(EVENING_JOB_DESCRIPTION);
  });
});
