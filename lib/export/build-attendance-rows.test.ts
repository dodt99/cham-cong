import { describe, expect, it } from "vitest";

import { OFF_LABEL } from "@/lib/export/constants";
import {
  buildAttendanceRows,
  buildEmployeeSegmentsForTest,
} from "@/lib/export/build-attendance-rows";
import {
  createEmptyEmployeeRow,
  type WeekSheet,
} from "@/lib/types/attendance";

const WEEK_START = "2026-01-05";
const EMPLOYEE_ID = "24662";

function rowWithWeekdays(
  days: Partial<
    Record<
      "mon" | "tue" | "wed" | "thu" | "fri",
      { shiftCode: string | null; offType?: "leave" | "sick" | "business_trip" | null }
    >
  >,
) {
  const row = createEmptyEmployeeRow();
  for (const [day, entry] of Object.entries(days)) {
    row.days[day as "mon"] = {
      ...row.days[day as "mon"],
      shiftCode: entry.shiftCode,
      offType: entry.shiftCode === null ? (entry.offType ?? "leave") : null,
      locationKey: null,
    };
  }
  return row;
}

function sheetForRow(row: ReturnType<typeof rowWithWeekdays>): WeekSheet {
  return {
    weekStart: WEEK_START,
    rows: { [EMPLOYEE_ID]: row },
  };
}

describe("buildAttendanceRows off types", () => {
  it("uses Nghỉ shift label for all off types", () => {
    const sheet = sheetForRow(
      rowWithWeekdays({
        mon: { shiftCode: null, offType: "sick" },
      }),
    );

    const rows = buildAttendanceRows(sheet).filter(
      (row) => row.employeeId === EMPLOYEE_ID,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.shiftLabel).toBe(OFF_LABEL);
    expect(rows[0]?.note).toBe("Nghỉ ốm");
  });

  it("leaves note empty for regular leave", () => {
    const sheet = sheetForRow(
      rowWithWeekdays({
        mon: { shiftCode: null, offType: "leave" },
      }),
    );

    const rows = buildAttendanceRows(sheet).filter(
      (row) => row.employeeId === EMPLOYEE_ID,
    );

    expect(rows[0]?.shiftLabel).toBe(OFF_LABEL);
    expect(rows[0]?.note).toBeNull();
  });

  it("writes Công tác in note column", () => {
    const sheet = sheetForRow(
      rowWithWeekdays({
        mon: { shiftCode: null, offType: "business_trip" },
      }),
    );

    const rows = buildAttendanceRows(sheet).filter(
      (row) => row.employeeId === EMPLOYEE_ID,
    );

    expect(rows[0]?.note).toBe("Công tác");
  });

  it("does not merge different off types on consecutive weekdays", () => {
    const row = rowWithWeekdays({
      mon: { shiftCode: null, offType: "leave" },
      tue: { shiftCode: null, offType: "sick" },
    });
    const segments = buildEmployeeSegmentsForTest(WEEK_START, row).filter(
      (segment) => segment.kind === "off",
    );

    expect(segments).toHaveLength(2);
    expect(segments[0]?.fromDate).toBe("2026-01-05");
    expect(segments[0]?.toDate).toBe("2026-01-05");
    expect(segments[1]?.fromDate).toBe("2026-01-06");
  });

  it("merges consecutive days with the same off type", () => {
    const row = rowWithWeekdays({
      mon: { shiftCode: null, offType: "sick" },
      tue: { shiftCode: null, offType: "sick" },
    });
    const segments = buildEmployeeSegmentsForTest(WEEK_START, row).filter(
      (segment) => segment.kind === "off",
    );

    expect(segments).toHaveLength(1);
    expect(segments[0]?.fromDate).toBe("2026-01-05");
    expect(segments[0]?.toDate).toBe("2026-01-06");
    expect(segments[0]?.offType).toBe("sick");
  });

  it("falls back missing offType to leave with empty note", () => {
    const row = createEmptyEmployeeRow();
    row.days.mon = {
      ...row.days.mon,
      shiftCode: null,
      offType: null,
    };

    const segments = buildEmployeeSegmentsForTest(WEEK_START, row).filter(
      (segment) => segment.kind === "off",
    );
    const rows = buildAttendanceRows({
      weekStart: WEEK_START,
      rows: { [EMPLOYEE_ID]: row },
    }).filter((entry) => entry.employeeId === EMPLOYEE_ID);

    expect(segments[0]?.offType).toBe("leave");
    expect(rows[0]?.note).toBeNull();
  });
});
