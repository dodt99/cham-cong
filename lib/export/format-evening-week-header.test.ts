import { describe, expect, it } from "vitest";
import { formatEveningWeekHeader } from "@/lib/export/format-evening-week-header";

describe("formatEveningWeekHeader", () => {
  it("formats Mon–Fri range for the week", () => {
    expect(formatEveningWeekHeader("2026-05-04")).toBe(
      "TỪ 04/05/2026 ĐẾN 08/05/2026",
    );
    expect(formatEveningWeekHeader("2026-02-02")).toBe(
      "TỪ 02/02/2026 ĐẾN 06/02/2026",
    );
  });
});
