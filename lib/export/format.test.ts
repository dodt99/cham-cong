import { describe, expect, it } from "vitest";
import { toExcelTimeValue } from "@/lib/export/format";

describe("toExcelTimeValue", () => {
  it("returns Excel day-fraction serial for HH:mm", () => {
    expect(toExcelTimeValue({ h: 6, m: 0 })).toBeCloseTo(6 / 24);
    expect(toExcelTimeValue({ h: 16, m: 30 })).toBeCloseTo((16 * 60 + 30) / (24 * 60));
    expect(toExcelTimeValue({ h: 5, m: 0 })).toBeCloseTo(5 / 24);
  });
});
