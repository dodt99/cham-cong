import { describe, expect, it } from "vitest";

import {
  normalizePersistedPayload,
  toPersistJson,
} from "@/lib/storage/normalize-persisted-payload";

describe("normalizePersistedPayload", () => {
  it("parses zustand persist wrapper", () => {
    const raw = JSON.stringify({
      state: { sheets: { "2026-01-05": { weekStart: "2026-01-05", rows: {} } }, activeWeekStart: "2026-01-05" },
      version: 0,
    });
    expect(normalizePersistedPayload(raw)).toEqual({
      sheets: { "2026-01-05": { weekStart: "2026-01-05", rows: {} } },
      activeWeekStart: "2026-01-05",
    });
  });

  it("parses legacy payload without state wrapper", () => {
    const raw = JSON.stringify({
      sheets: { "2026-01-12": { weekStart: "2026-01-12", rows: {} } },
      activeWeekStart: "2026-01-12",
    });
    expect(normalizePersistedPayload(raw)).toEqual({
      sheets: { "2026-01-12": { weekStart: "2026-01-12", rows: {} } },
      activeWeekStart: "2026-01-12",
    });
  });

  it("migrates legacy off days to default offType leave", () => {
    const raw = JSON.stringify({
      state: {
        sheets: {
          "2026-01-05": {
            weekStart: "2026-01-05",
            rows: {
              "001": {
                defaultShiftCode: null,
                defaultLocationKey: null,
                days: {
                  mon: {
                    shiftCode: null,
                    locationKey: null,
                    extraEvening: false,
                    eveningLocationKey: null,
                  },
                },
              },
            },
          },
        },
        activeWeekStart: "2026-01-05",
      },
      version: 0,
    });

    const store = normalizePersistedPayload(raw);
    const row = store?.sheets["2026-01-05"]?.rows["001"];

    expect(row?.defaultOffType).toBe("leave");
    expect(row?.days.mon.offType).toBe("leave");
  });

  it("returns null for invalid json", () => {
    expect(normalizePersistedPayload("not-json")).toBeNull();
  });

  it("round-trips via toPersistJson", () => {
    const store = { sheets: {}, activeWeekStart: null };
    expect(normalizePersistedPayload(toPersistJson(store))).toEqual(store);
  });
});
