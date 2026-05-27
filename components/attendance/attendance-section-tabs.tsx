"use client";

import { useState, useTransition } from "react";

import { EarlyAttendanceTable } from "@/components/attendance/early-attendance-table";
import {
  AttendanceTableSkeleton,
  DeferredTabPanel,
} from "@/components/attendance/deferred-tab-panel";
import { EveningExportAttendanceTable } from "@/components/attendance/evening-export-attendance-table";
import { WeekendExportAttendanceTable } from "@/components/attendance/weekend-export-attendance-table";
import { EveningTabContent } from "@/components/attendance/evening-tab-content";
import { ExportPreviewTable } from "@/components/attendance/export-preview-table";
import { WeekdayAttendanceTable } from "@/components/attendance/weekday-attendance-table";
import { WeekendAttendanceTable } from "@/components/attendance/weekend-attendance-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selectHasActiveSheet } from "@/lib/attendance/selectors";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

const DEFAULT_TAB = "weekday";

export function AttendanceSectionTabs() {
  const hasActiveSheet = useAttendanceZustandStore(selectHasActiveSheet);
  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);
  const [renderedTab, setRenderedTab] = useState(DEFAULT_TAB);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    startTransition(() => {
      setRenderedTab(value);
    });
  };

  if (!hasActiveSheet) {
    return (
      <div className="flex min-h-[320px] min-w-0 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4 text-center sm:p-8">
        <p className="text-lg font-medium">Chưa có bảng chấm công</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Bấm &quot;Tạo bảng mới&quot; để chọn tuần và bắt đầu chấm công. Dữ
          liệu được lưu tự động trên trình duyệt.
        </p>
      </div>
    );
  }

  return (
    <Tabs
      value={selectedTab}
      onValueChange={handleTabChange}
      className="w-full min-w-0"
    >
      <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="weekday">Ngày thường</TabsTrigger>
        <TabsTrigger value="evening">Tối</TabsTrigger>
        <TabsTrigger value="weekend">T7-CN</TabsTrigger>
        <TabsTrigger value="export-fast">Export Fast</TabsTrigger>
        <TabsTrigger value="export-early">Export Sớm</TabsTrigger>
        <TabsTrigger value="export-evening">Export Tối</TabsTrigger>
        <TabsTrigger value="export-weekend">Export T7-CN</TabsTrigger>
      </TabsList>

      <TabsContent value="weekday" className="min-w-0">
        <DeferredTabPanel
          tabValue="weekday"
          fallback={<AttendanceTableSkeleton />}
          selectedTab={selectedTab}
          renderedTab={renderedTab}
          isPending={isPending}
        >
          <WeekdayAttendanceTable />
        </DeferredTabPanel>
      </TabsContent>

      <TabsContent value="weekend" className="min-w-0">
        <WeekendAttendanceTable />
      </TabsContent>

      <TabsContent value="evening" className="min-w-0">
        <EveningTabContent />
      </TabsContent>

      <TabsContent value="export-fast" className="min-w-0">
        <ExportPreviewTable />
      </TabsContent>

      <TabsContent value="export-early" className="min-w-0">
        <EarlyAttendanceTable />
      </TabsContent>

      <TabsContent value="export-evening" className="min-w-0">
        <EveningExportAttendanceTable />
      </TabsContent>

      <TabsContent value="export-weekend" className="min-w-0">
        <WeekendExportAttendanceTable />
      </TabsContent>
    </Tabs>
  );
}
