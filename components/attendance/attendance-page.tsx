"use client";

import { Suspense } from "react";

import { AttendancePageHeader } from "@/components/attendance/attendance-page-header";
import { AttendanceSectionTabs } from "@/components/attendance/attendance-section-tabs";
import { Button } from "@/components/ui/button";
import { useAttendanceHydrated } from "@/hooks/use-attendance-hydrated";

export function AttendancePage() {
  const { hydrated, error, retry } = useAttendanceHydrated();

  if (error) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">
          Kiểm tra cấu hình Firebase
        </p>
        <Button type="button" variant="outline" onClick={retry}>
          Thử lại
        </Button>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-full flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:gap-8 lg:p-8">
      <AttendancePageHeader />
      <Suspense fallback={<div className="min-h-80 animate-pulse rounded-lg bg-muted/40" />}>
        <AttendanceSectionTabs />
      </Suspense>
    </main>
  );
}
