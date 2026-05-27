import { describe, expect, it } from "vitest";

import { EMPLOYEES } from "@/lib/constants/employees";
import { filterEmployeesByQuery } from "@/lib/utils/filter-employees";

describe("filterEmployeesByQuery", () => {
  it("returns all employees when query is empty", () => {
    expect(filterEmployeesByQuery(EMPLOYEES, "")).toHaveLength(EMPLOYEES.length);
    expect(filterEmployeesByQuery(EMPLOYEES, "   ")).toHaveLength(
      EMPLOYEES.length,
    );
  });

  it("filters by employee id", () => {
    const result = filterEmployeesByQuery(EMPLOYEES, "24662");
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("24662");
  });

  it("filters by name without diacritics", () => {
    const result = filterEmployeesByQuery(EMPLOYEES, "nguyen tra my");
    expect(result.some((e) => e.id === "24662")).toBe(true);
  });
});
