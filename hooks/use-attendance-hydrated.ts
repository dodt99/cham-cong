"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { subscribeAttendance } from "@/lib/storage/firestore-attendance-repository";
import { setApplyingRemote } from "@/lib/storage/remote-sync-flag";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

function storeFingerprint(sheets: unknown, activeWeekStart: string | null) {
  return JSON.stringify({ sheets, activeWeekStart });
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Không thể tải dữ liệu.";
}

function rehydrateAttendance(): Promise<void> {
  return Promise.resolve(useAttendanceZustandStore.persist.rehydrate());
}

export function useAttendanceHydrated() {
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRemoteUpdatedAtMs = useRef<number | null>(null);

  const applyRemoteSnapshot = useCallback(
    (
      sheets: ReturnType<typeof useAttendanceZustandStore.getState>["sheets"],
      activeWeekStart: string | null,
      updatedAtMs: number | null,
    ) => {
      if (
        updatedAtMs !== null &&
        updatedAtMs === lastRemoteUpdatedAtMs.current
      ) {
        return;
      }
      lastRemoteUpdatedAtMs.current = updatedAtMs;

      const local = useAttendanceZustandStore.getState();
      if (
        storeFingerprint(local.sheets, local.activeWeekStart) ===
        storeFingerprint(sheets, activeWeekStart)
      ) {
        return;
      }

      setApplyingRemote(true);
      useAttendanceZustandStore.setState({ sheets, activeWeekStart });
      queueMicrotask(() => setApplyingRemote(false));
    },
    [],
  );

  const startSubscription = useCallback(() => {
    return subscribeAttendance(
      ({ sheets, activeWeekStart, updatedAtMs }) => {
        applyRemoteSnapshot(sheets, activeWeekStart, updatedAtMs);
      },
      (err) => {
        setError(err.message || "Không thể đồng bộ dữ liệu từ Firestore.");
      },
    );
  }, [applyRemoteSnapshot]);

  const retry = useCallback(() => {
    setError(null);
    setHydrated(false);
    lastRemoteUpdatedAtMs.current = null;
    void rehydrateAttendance().catch((err: unknown) => {
      setError(toErrorMessage(err));
    });
  }, []);

  useEffect(() => {
    let unsubFirestore: (() => void) | undefined;

    const markHydrated = () => {
      setHydrated(true);
      setError(null);
      unsubFirestore = startSubscription();
    };

    const unsubHydration =
      useAttendanceZustandStore.persist.onFinishHydration(markHydrated);

    if (useAttendanceZustandStore.persist.hasHydrated()) {
      markHydrated();
    } else {
      void rehydrateAttendance().catch((err: unknown) => {
        setError(toErrorMessage(err));
      });
    }

    return () => {
      unsubHydration();
      unsubFirestore?.();
    };
  }, [startSubscription]);

  return { hydrated, error, retry };
}
