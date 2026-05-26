import { describe, expect, it } from "vitest";
import { formatEarlyWeekHeader } from "@/lib/export/format-early-week-header";

describe("formatEarlyWeekHeader", () => {
  it("formats Mon–Fri range for the week", () => {
    expect(formatEarlyWeekHeader("2026-05-04")).toBe("NGÀY 04-08/5/2026");
    expect(formatEarlyWeekHeader("2026-05-18")).toBe("NGÀY 18-22/5/2026");
  });
});
