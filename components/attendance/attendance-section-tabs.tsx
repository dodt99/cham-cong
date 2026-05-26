"use client";

import { EarlyAttendanceTable } from "@/components/attendance/early-attendance-table";
import { EveningTabContent } from "@/components/attendance/evening-tab-content";
import { ExportPreviewTable } from "@/components/attendance/export-preview-table";
import { WeekdayAttendanceTable } from "@/components/attendance/weekday-attendance-table";
import { WeekendAttendanceTable } from "@/components/attendance/weekend-attendance-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selectHasActiveSheet } from "@/lib/attendance/selectors";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function AttendanceSectionTabs() {
  const hasActiveSheet = useAttendanceZustandStore(selectHasActiveSheet);

  if (!hasActiveSheet) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center">
        <p className="text-lg font-medium">Chưa có bảng chấm công</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Bấm &quot;Tạo bảng mới&quot; để chọn tuần và bắt đầu chấm công. Dữ
          liệu được lưu tự động trên trình duyệt.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="weekday" className="w-full">
      <TabsList className="mb-4 h-auto flex-wrap">
        <TabsTrigger value="weekday">Ngày thường</TabsTrigger>
        <TabsTrigger value="weekend">T7 – CN</TabsTrigger>
        <TabsTrigger value="evening">Tối</TabsTrigger>
        <TabsTrigger value="summary">Tổng hợp</TabsTrigger>
        <TabsTrigger value="early">Làm sớm</TabsTrigger>
      </TabsList>

      <TabsContent value="weekday" className="overflow-x-auto">
        <WeekdayAttendanceTable />
      </TabsContent>

      <TabsContent value="weekend" className="overflow-x-auto">
        <WeekendAttendanceTable />
      </TabsContent>

      <TabsContent value="evening">
        <EveningTabContent />
      </TabsContent>

      <TabsContent value="summary" className="overflow-x-auto">
        <ExportPreviewTable />
      </TabsContent>

      <TabsContent value="early" className="overflow-x-auto">
        <EarlyAttendanceTable />
      </TabsContent>
    </Tabs>
  );
}
