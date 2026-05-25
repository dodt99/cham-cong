"use client";

import { AttendanceTable } from "@/components/attendance/attendance-table";
import { CreateWeekDialog } from "@/components/attendance/create-week-dialog";
import { WeekTabs } from "@/components/attendance/week-tabs";
import { useAttendanceStore } from "@/hooks/use-attendance-store";
import { formatWeekRange } from "@/lib/utils/week";

export function AttendancePage() {
  const {
    store,
    hydrated,
    activeSheet,
    weekStarts,
    createWeek,
    setActiveWeek,
    setDefaultShift,
    setDayShift,
    setExtraEvening,
  } = useAttendanceStore();

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[100%] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chấm công</h1>
          {store.activeWeekStart && (
            <p className="mt-1 text-sm text-muted-foreground">
              Tuần đang xem:{" "}
              <span className="font-semibold text-foreground">
                {formatWeekRange(store.activeWeekStart)}
              </span>
            </p>
          )}
        </div>
        <CreateWeekDialog
          onCreateWeek={createWeek}
          existingWeeks={weekStarts}
        />
      </header>

      <WeekTabs
        weekStarts={weekStarts}
        activeWeekStart={store.activeWeekStart}
        onChange={setActiveWeek}
      />

      {activeSheet ? (
        <div className="overflow-x-auto">
          <AttendanceTable
            sheet={activeSheet}
            onDefaultShift={setDefaultShift}
            onDayShift={setDayShift}
            onExtraEvening={setExtraEvening}
          />
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
          <p className="text-lg font-medium">Chưa có bảng chấm công</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Bấm &quot;Tạo bảng mới&quot; để chọn tuần và bắt đầu chấm công.
            Dữ liệu được lưu tự động trên trình duyệt.
          </p>
        </div>
      )}
    </div>
  );
}
