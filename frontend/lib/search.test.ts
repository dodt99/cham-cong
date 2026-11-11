import { describe, expect, it } from "vitest";

import type { Member } from "@/lib/api/types";
import { filterMembers } from "@/lib/search";

const members: Member[] = [
  { employeeId: 1, code: "24662", fullName: "Nguyễn Trà My", membership: "CORE" },
  { employeeId: 2, code: "24675", fullName: "Đào Yến Linh", membership: "CORE" },
];

describe("filterMembers", () => {
  it("matches without diacritics and case", () => {
    expect(filterMembers(members, "tra my").map((m) => m.code)).toEqual(["24662"]);
    expect(filterMembers(members, "NGUYEN").map((m) => m.code)).toEqual(["24662"]);
  });

  it("matches by employee code", () => {
    expect(filterMembers(members, "24675").map((m) => m.code)).toEqual(["24675"]);
  });

  it("treats đ as d (v1 could not find 'dao')", () => {
    expect(filterMembers(members, "dao").map((m) => m.code)).toEqual(["24675"]);
  });

  it("returns everyone for an empty query", () => {
    expect(filterMembers(members, "  ")).toHaveLength(2);
  });
});
