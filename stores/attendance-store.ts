import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createEmptyStore,
  createEmptyWeekSheet,
  STORAGE_KEY,
} from "@/lib/storage/attendance-storage";
import { createFirestorePersistStorage } from "@/lib/storage/firestore-persist-storage";
import {
  DAY_KEYS,
  type AttendanceStore,
  type DayKey,
} from "@/lib/types/attendance";

type AttendanceActions = {
  createWeek: (weekStart: string) => void;
  setActiveWeek: (weekStart: string) => void;
  setDefaultShift: (employeeId: string, code: string | null) => void;
  setDefaultLocation: (employeeId: string, key: string | null) => void;
  setDayShift: (
    employeeId: string,
    day: DayKey,
    code: string | null,
  ) => void;
  setDayLocation: (
    employeeId: string,
    day: DayKey,
    key: string | null,
  ) => void;
  setExtraEvening: (
    employeeId: string,
    day: DayKey,
    checked: boolean,
  ) => void;
  setEveningLocation: (
    employeeId: string,
    day: DayKey,
    key: string | null,
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
        for (const day of DAY_KEYS.slice(0, 5)) {
          const prev = row.days[day];
          row.days[day] = {
            ...prev,
            shiftCode: code,
            locationKey: code === null ? null : prev.locationKey,
          };
        }
        rows[employeeId] = row;
        sheet.rows = rows;

        set({
          sheets: { ...sheets, [activeWeekStart]: sheet },
        });
      },

      setDefaultLocation: (employeeId, key) => {
        const { activeWeekStart, sheets } = get();
        if (!activeWeekStart || !sheets[activeWeekStart]) return;

        const sheet = { ...sheets[activeWeekStart] };
        const rows = { ...sheet.rows };
        const row = {
          ...rows[employeeId],
          defaultLocationKey: key,
          days: { ...rows[employeeId].days },
        };
        for (const day of DAY_KEYS.slice(0, 5)) {
          row.days[day] = { ...row.days[day], locationKey: key };
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
        const prev = rows[employeeId].days[day];
        rows[employeeId] = {
          ...rows[employeeId],
          days: {
            ...rows[employeeId].days,
            [day]: {
              ...prev,
              shiftCode: code,
              locationKey: code === null ? null : prev.locationKey,
            },
          },
        };
        sheet.rows = rows;

        set({
          sheets: { ...sheets, [activeWeekStart]: sheet },
        });
      },

      setDayLocation: (employeeId, day, key) => {
        const { activeWeekStart, sheets } = get();
        if (!activeWeekStart || !sheets[activeWeekStart]) return;

        const sheet = { ...sheets[activeWeekStart] };
        const rows = { ...sheet.rows };
        rows[employeeId] = {
          ...rows[employeeId],
          days: {
            ...rows[employeeId].days,
            [day]: { ...rows[employeeId].days[day], locationKey: key },
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
        const prev = rows[employeeId].days[day];
        rows[employeeId] = {
          ...rows[employeeId],
          days: {
            ...rows[employeeId].days,
            [day]: {
              ...prev,
              extraEvening: checked,
              eveningLocationKey: checked ? prev.eveningLocationKey : null,
            },
          },
        };
        sheet.rows = rows;

        set({
          sheets: { ...sheets, [activeWeekStart]: sheet },
        });
      },

      setEveningLocation: (employeeId, day, key) => {
        const { activeWeekStart, sheets } = get();
        if (!activeWeekStart || !sheets[activeWeekStart]) return;

        const sheet = { ...sheets[activeWeekStart] };
        const rows = { ...sheet.rows };
        rows[employeeId] = {
          ...rows[employeeId],
          days: {
            ...rows[employeeId].days,
            [day]: {
              ...rows[employeeId].days[day],
              eveningLocationKey: key,
            },
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
      storage: createJSONStorage(() => createFirestorePersistStorage()),
      partialize: (state) => ({
        sheets: state.sheets,
        activeWeekStart: state.activeWeekStart,
      }),
    },
  ),
);
