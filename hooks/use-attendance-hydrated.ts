"use client";

import { useEffect, useState } from "react";

import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function useAttendanceHydrated() {
  const [hydrated, setHydrated] = useState(
    () => useAttendanceZustandStore.persist.hasHydrated(),
  );

  useEffect(() => {
    const unsub = useAttendanceZustandStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    void useAttendanceZustandStore.persist.rehydrate();
    return unsub;
  }, []);

  return hydrated;
}
