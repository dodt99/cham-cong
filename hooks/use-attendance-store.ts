"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  createEmptyStore,
  createEmptyWeekSheet,
  loadStore,
  saveStore,
} from "@/lib/storage/attendance-storage";
import {
  DAY_KEYS,
  type AttendanceStore,
  type DayKey,
} from "@/lib/types/attendance";

const STORAGE_EVENT = "cham-cong-storage-change";

let clientStore: AttendanceStore | null = null;

function getClientStore(): AttendanceStore {
  if (clientStore === null) {
    clientStore = loadStore();
  }
  return clientStore;
}

function setClientStore(next: AttendanceStore) {
  clientStore = next;
  saveStore(next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener(STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function getSnapshot(): AttendanceStore {
  return getClientStore();
}

/** Stable reference for SSR/hydration — must not allocate on each call. */
const SERVER_SNAPSHOT: AttendanceStore = createEmptyStore();

function getServerSnapshot(): AttendanceStore {
  return SERVER_SNAPSHOT;
}

export function useAttendanceStore() {
  const store = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const createWeek = useCallback((weekStart: string) => {
    setClientStore((() => {
      const prev = getClientStore();
      const sheets = { ...prev.sheets };
      if (!sheets[weekStart]) {
        sheets[weekStart] = createEmptyWeekSheet(weekStart);
      }
      return { sheets, activeWeekStart: weekStart };
    })());
  }, []);

  const setActiveWeek = useCallback((weekStart: string) => {
    const prev = getClientStore();
    setClientStore({ ...prev, activeWeekStart: weekStart });
  }, []);

  const setDefaultShift = useCallback(
    (employeeId: string, code: string | null) => {
      const prev = getClientStore();
      const weekStart = prev.activeWeekStart;
      if (!weekStart || !prev.sheets[weekStart]) return;

      const sheet = { ...prev.sheets[weekStart] };
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

      setClientStore({
        ...prev,
        sheets: { ...prev.sheets, [weekStart]: sheet },
      });
    },
    [],
  );

  const setDayShift = useCallback(
    (employeeId: string, day: DayKey, code: string | null) => {
      const prev = getClientStore();
      const weekStart = prev.activeWeekStart;
      if (!weekStart || !prev.sheets[weekStart]) return;

      const sheet = { ...prev.sheets[weekStart] };
      const rows = { ...sheet.rows };
      rows[employeeId] = {
        ...rows[employeeId],
        days: {
          ...rows[employeeId].days,
          [day]: { ...rows[employeeId].days[day], shiftCode: code },
        },
      };
      sheet.rows = rows;

      setClientStore({
        ...prev,
        sheets: { ...prev.sheets, [weekStart]: sheet },
      });
    },
    [],
  );

  const setExtraEvening = useCallback(
    (employeeId: string, day: DayKey, checked: boolean) => {
      const prev = getClientStore();
      const weekStart = prev.activeWeekStart;
      if (!weekStart || !prev.sheets[weekStart]) return;

      const sheet = { ...prev.sheets[weekStart] };
      const rows = { ...sheet.rows };
      rows[employeeId] = {
        ...rows[employeeId],
        days: {
          ...rows[employeeId].days,
          [day]: { ...rows[employeeId].days[day], extraEvening: checked },
        },
      };
      sheet.rows = rows;

      setClientStore({
        ...prev,
        sheets: { ...prev.sheets, [weekStart]: sheet },
      });
    },
    [],
  );

  const activeSheet =
    store.activeWeekStart != null
      ? store.sheets[store.activeWeekStart] ?? null
      : null;

  const weekStarts = Object.keys(store.sheets);

  return {
    store,
    hydrated,
    activeSheet,
    weekStarts,
    createWeek,
    setActiveWeek,
    setDefaultShift,
    setDayShift,
    setExtraEvening,
  };
}
