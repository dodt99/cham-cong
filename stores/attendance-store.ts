import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createEmptyStore,
  createEmptyWeekSheet,
  STORAGE_KEY,
} from "@/lib/storage/attendance-storage";
import { createDebouncedLocalStorage } from "@/lib/storage/debounced-storage";
import {
  DAY_KEYS,
  type AttendanceStore,
  type DayKey,
  type WeekSheet,
} from "@/lib/types/attendance";

function createAttendancePersistStorage() {
  const debounced = createDebouncedLocalStorage(100);
  return {
    ...debounced,
    getItem: (name: string) => {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as {
          state?: AttendanceStore;
          sheets?: Record<string, WeekSheet>;
          activeWeekStart?: string | null;
        };
        if (parsed.state) return raw;
        if (parsed.sheets && typeof parsed.sheets === "object") {
          return JSON.stringify({
            state: {
              sheets: parsed.sheets,
              activeWeekStart: parsed.activeWeekStart ?? null,
            },
            version: 0,
          });
        }
      } catch {
        return null;
      }
      return null;
    },
  };
}

type AttendanceActions = {
  createWeek: (weekStart: string) => void;
  setActiveWeek: (weekStart: string) => void;
  setDefaultShift: (employeeId: string, code: string | null) => void;
  setDayShift: (
    employeeId: string,
    day: DayKey,
    code: string | null,
  ) => void;
  setExtraEvening: (
    employeeId: string,
    day: DayKey,
    checked: boolean,
  ) => void;
  clearAllData: () => void;
};

export type AttendanceState = AttendanceStore & AttendanceActions;

export const useAttendanceZustandStore = create<AttendanceState>()(
  persist(
    (set, get) => ({
      sheets: {},
      activeWeekStart: null,

      createWeek: (weekStart) => {
        const { sheets } = get();
        const nextSheets = { ...sheets };
        if (!nextSheets[weekStart]) {
          nextSheets[weekStart] = createEmptyWeekSheet(weekStart);
        }
        set({ sheets: nextSheets, activeWeekStart: weekStart });
      },

      setActiveWeek: (weekStart) => {
        set({ activeWeekStart: weekStart });
      },

      setDefaultShift: (employeeId, code) => {
        const { activeWeekStart, sheets } = get();
        if (!activeWeekStart || !sheets[activeWeekStart]) return;

        const sheet = { ...sheets[activeWeekStart] };
        const rows = { ...sheet.rows };
        const row = {
          ...rows[employeeId],
          defaultShiftCode: code,
          days: { ...rows[employeeId].days },
        };
        for (const day of DAY_KEYS) {
          row.days[day] = { ...row.days[day], shiftCode: code };
        }
        rows[employeeId] = row;
        sheet.rows = rows;

        set({
          sheets: { ...sheets, [activeWeekStart]: sheet },
        });
      },

      setDayShift: (employeeId, day, code) => {
        const { activeWeekStart, sheets } = get();
        if (!activeWeekStart || !sheets[activeWeekStart]) return;

        const sheet = { ...sheets[activeWeekStart] };
        const rows = { ...sheet.rows };
        rows[employeeId] = {
          ...rows[employeeId],
          days: {
            ...rows[employeeId].days,
            [day]: { ...rows[employeeId].days[day], shiftCode: code },
          },
        };
        sheet.rows = rows;

        set({
          sheets: { ...sheets, [activeWeekStart]: sheet },
        });
      },

      setExtraEvening: (employeeId, day, checked) => {
        const { activeWeekStart, sheets } = get();
        if (!activeWeekStart || !sheets[activeWeekStart]) return;

        const sheet = { ...sheets[activeWeekStart] };
        const rows = { ...sheet.rows };
        rows[employeeId] = {
          ...rows[employeeId],
          days: {
            ...rows[employeeId].days,
            [day]: { ...rows[employeeId].days[day], extraEvening: checked },
          },
        };
        sheet.rows = rows;

        set({
          sheets: { ...sheets, [activeWeekStart]: sheet },
        });
      },

      clearAllData: () => {
        set(createEmptyStore());
        if (typeof window !== "undefined") {
          void useAttendanceZustandStore.persist.clearStorage();
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createAttendancePersistStorage()),
      partialize: (state) => ({
        sheets: state.sheets,
        activeWeekStart: state.activeWeekStart,
      }),
    },
  ),
);
