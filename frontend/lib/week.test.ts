import { describe, expect, it } from "vitest";

import { addDays, dayIndex, formatDayHeader, formatWeekRange, isISODate, isWeekend, weekStartOf } from "@/lib/week";

describe("week helpers", () => {
  it("finds the Monday of any day, including Sunday", () => {
    expect(weekStartOf("2026-05-04")).toBe("2026-05-04");
    expect(weekStartOf("2026-05-07")).toBe("2026-05-04");
    expect(weekStartOf("2026-05-10")).toBe("2026-05-04");
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-04-27", 4)).toBe("2026-05-01");
    expect(addDays("2026-12-28", 6)).toBe("2027-01-03");
  });

  it("labels days and weeks like v1", () => {
    expect(formatDayHeader("2026-05-04")).toBe("T2 04/05");
    expect(formatDayHeader("2026-05-10")).toBe("CN 10/05");
    expect(formatWeekRange("2026-12-28")).toBe("T2 28/12 – CN 03/01/2027");
  });

  it("knows weekends and valid dates", () => {
    expect(dayIndex("2026-05-09")).toBe(5);
    expect(isWeekend("2026-05-09")).toBe(true);
    expect(isWeekend("2026-05-08")).toBe(false);
    expect(isISODate("2026-02-30")).toBe(false);
    expect(isISODate("abc")).toBe(false);
  });
});
