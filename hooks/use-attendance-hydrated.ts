"use client";

import { useEffect, useState } from "react";

import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function useAttendanceHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const markHydrated = () => setHydrated(true);

    if (useAttendanceZustandStore.persist.hasHydrated()) {
      markHydrated();
      return;
    }

    const unsub = useAttendanceZustandStore.persist.onFinishHydration(markHydrated);
    void useAttendanceZustandStore.persist.rehydrate();

    return unsub;
  }, []);

  return hydrated;
}
