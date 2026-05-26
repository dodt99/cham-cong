import { describe, expect, it } from "vitest";
import { formatWeekendSheetTitle } from "@/lib/export/format-weekend-day-header";

describe("formatWeekendSheetTitle", () => {
  it("formats Saturday title", () => {
    expect(formatWeekendSheetTitle("sat", "2026-05-09")).toBe(
      "KHÁM CHỮA BỆNH THỨ 7 NGÀY 09/5/2026",
    );
  });

  it("formats Sunday title", () => {
    expect(formatWeekendSheetTitle("sun", "2026-05-10")).toBe(
      "KHÁM CHỮA BỆNH CHỦ NHẬT NGÀY 10/5/2026",
    );
  });
});
