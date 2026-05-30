"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const ATTENDANCE_TABS = [
  "weekday",
  "evening",
  "weekend",
  "export-fast",
  "export-early",
  "export-evening",
  "export-weekend",
] as const;

type AttendanceTab = (typeof ATTENDANCE_TABS)[number];

const isAttendanceTab = (value: string | null): value is AttendanceTab =>
  value !== null && (ATTENDANCE_TABS as readonly string[]).includes(value);

const tabFromSearchParams = (searchParams: URLSearchParams): AttendanceTab => {
  const param = searchParams.get("tab");
  return isAttendanceTab(param) ? param : DEFAULT_TAB;
};

export function AttendanceSectionTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasActiveSheet = useAttendanceZustandStore(selectHasActiveSheet);
  const selectedTab = tabFromSearchParams(searchParams);
  const [renderedTab, setRenderedTab] = useState(selectedTab);
  const [isPending, startTransition] = useTransition();
  const deferredRenderedTab = isPending ? renderedTab : selectedTab;

  const handleTabChange = (value: string) => {
    if (!isAttendanceTab(value)) return;

    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_TAB) {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });

    setRenderedTab(selectedTab);
    startTransition(() => {
      setRenderedTab(value);
    });
  };

  if (!hasActiveSheet) {
    return (
      <div className="flex min-h-80 min-w-0 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4 text-center sm:p-8">
        <p className="text-lg font-medium">Chưa có bảng chấm công</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Bấm &quot;Tạo bảng mới&quot; để chọn tuần và bắt đầu chấm công.
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
          renderedTab={deferredRenderedTab}
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
