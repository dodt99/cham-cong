"use client";

import { AttendancePageHeaderV2 } from "@/components/attendance/v2/attendance-page-header-v2";
import { AttendanceSectionTabs } from "@/components/attendance/v2/attendance-section-tabs";
import { AttendanceWeekTabs } from "@/components/attendance/attendance-week-tabs";
import { useAttendanceHydrated } from "@/hooks/use-attendance-hydrated";

export function AttendancePageV2() {
  const hydrated = useAttendanceHydrated();

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[100%] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <AttendancePageHeaderV2 />
      <AttendanceWeekTabs />
      <AttendanceSectionTabs />
    </div>
  );
}
