"use client";

import { EarlyAttendanceTable } from "@/components/attendance/early-attendance-table";
import { EveningExportAttendanceTable } from "@/components/attendance/evening-export-attendance-table";
import { WeekendExportAttendanceTable } from "@/components/attendance/weekend-export-attendance-table";
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
        <TabsTrigger value="evening">Tối</TabsTrigger>
        <TabsTrigger value="weekend">T7-CN</TabsTrigger>
        <TabsTrigger value="export-fast">Export Fast</TabsTrigger>
        <TabsTrigger value="export-early">Export Sớm</TabsTrigger>
        <TabsTrigger value="export-evening">Export Tối</TabsTrigger>
        <TabsTrigger value="export-weekend">Export T7-CN</TabsTrigger>
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

      <TabsContent value="export-fast" className="overflow-x-auto">
        <ExportPreviewTable />
      </TabsContent>

      <TabsContent value="export-early" className="overflow-x-auto">
        <EarlyAttendanceTable />
      </TabsContent>

      <TabsContent value="export-evening" className="overflow-x-auto">
        <EveningExportAttendanceTable />
      </TabsContent>

      <TabsContent value="export-weekend" className="overflow-x-auto">
        <WeekendExportAttendanceTable />
      </TabsContent>
    </Tabs>
  );
}
