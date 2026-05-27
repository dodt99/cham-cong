"use client";

import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { getFirestoreDb } from "@/lib/firebase/client";
import { createEmptyStore } from "@/lib/storage/attendance-storage";
import type { AttendanceStore } from "@/lib/types/attendance";

export const ATTENDANCE_COLLECTION = "attendance";
export const ATTENDANCE_DOC_ID = "main";

export type AttendanceFirestoreDoc = AttendanceStore & {
  updatedAt?: Timestamp | null;
};

function attendanceDocRef() {
  return doc(getFirestoreDb(), ATTENDANCE_COLLECTION, ATTENDANCE_DOC_ID);
}

function stripUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function toUpdatedAtMs(value: unknown): number | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof (value as { toMillis?: unknown }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    "nanoseconds" in value
  ) {
    const seconds = (value as { seconds: unknown }).seconds;
    const nanoseconds = (value as { nanoseconds: unknown }).nanoseconds;
    if (typeof seconds === "number" && typeof nanoseconds === "number") {
      return seconds * 1000 + Math.floor(nanoseconds / 1_000_000);
    }
  }
  return null;
}

function parseDocData(
  data: Record<string, unknown> | undefined,
): AttendanceStore {
  if (!data) return createEmptyStore();
  return {
    sheets:
      (data.sheets as AttendanceStore["sheets"] | undefined) ?? {},
    activeWeekStart:
      (data.activeWeekStart as string | null | undefined) ?? null,
  };
}

export async function loadAttendance(): Promise<AttendanceStore> {
  const snap = await getDoc(attendanceDocRef());
  if (!snap.exists()) return createEmptyStore();
  return parseDocData(snap.data() as Record<string, unknown>);
}

export async function saveAttendance(store: AttendanceStore): Promise<void> {
  // Only strip undefined from plain data. Keep serverTimestamp() intact.
  const plain = stripUndefined({
    sheets: store.sheets,
    activeWeekStart: store.activeWeekStart,
  });
  await setDoc(
    attendanceDocRef(),
    { ...plain, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function clearAttendance(): Promise<void> {
  await deleteDoc(attendanceDocRef());
}

export type AttendanceSnapshot = AttendanceStore & {
  updatedAtMs: number | null;
};

export function subscribeAttendance(
  onChange: (snapshot: AttendanceSnapshot) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    attendanceDocRef(),
    (snap) => {
      const data = snap.data() as Record<string, unknown> | undefined;
      const store = parseDocData(data);
      onChange({
        ...store,
        updatedAtMs: toUpdatedAtMs(data?.updatedAt),
      });
    },
    (error) => {
      onError?.(error);
    },
  );
}
