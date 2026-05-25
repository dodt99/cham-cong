"use client";

import { AttendanceTable } from "@/components/attendance/attendance-table";
import { selectHasActiveSheet } from "@/lib/attendance/selectors";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function AttendanceTableSection() {
  const hasActiveSheet = useAttendanceZustandStore(selectHasActiveSheet);

  if (hasActiveSheet) {
    return (
      <div className="overflow-x-auto">
        <AttendanceTable />
      </div>
    );
  }

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
      <p className="text-lg font-medium">Chưa có bảng chấm công</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Bấm &quot;Tạo bảng mới&quot; để chọn tuần và bắt đầu chấm công. Dữ liệu
        được lưu tự động trên trình duyệt.
      </p>
    </div>
  );
}
