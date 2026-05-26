"use client";

import { AttendancePageHeader } from "@/components/attendance/attendance-page-header";
import { AttendanceSectionTabs } from "@/components/attendance/attendance-section-tabs";
import { useAttendanceHydrated } from "@/hooks/use-attendance-hydrated";

export function AttendancePage() {
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
      <AttendancePageHeader />
      <AttendanceSectionTabs />
    </div>
  );
}
