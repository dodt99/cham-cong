import type { AttendanceStore, WeekSheet } from "@/lib/types/attendance";

type LegacyPayload = {
  state?: AttendanceStore;
  sheets?: Record<string, WeekSheet>;
  activeWeekStart?: string | null;
  version?: number;
};

export function normalizePersistedPayload(
  raw: string | null,
): AttendanceStore | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LegacyPayload;
    if (parsed.state) {
      return {
        sheets: parsed.state.sheets ?? {},
        activeWeekStart: parsed.state.activeWeekStart ?? null,
      };
    }
    if (parsed.sheets && typeof parsed.sheets === "object") {
      return {
        sheets: parsed.sheets,
        activeWeekStart: parsed.activeWeekStart ?? null,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function toPersistJson(state: AttendanceStore): string {
  return JSON.stringify({
    state: {
      sheets: state.sheets,
      activeWeekStart: state.activeWeekStart,
    },
    version: 0,
  });
}
