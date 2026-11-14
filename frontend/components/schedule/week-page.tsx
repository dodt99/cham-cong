"use client";

import { useMemo, useState } from "react";

import { EveningTab } from "@/components/schedule/evening-tab";
import { ExportPanel } from "@/components/schedule/export-panel";
import { ScheduleEnvironmentProvider } from "@/components/schedule/schedule-context";
import { ScheduleTable } from "@/components/schedule/schedule-table";
import { StatusToasts } from "@/components/schedule/status-toasts";
import { WeekHeader } from "@/components/schedule/week-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildCatalogView, buildCellMap } from "@/lib/schedule/model";
import { useApplyToWeekdays, useCatalog, useCellWriter, useMe, useWeek } from "@/lib/schedule/queries";

const TAB_STORAGE_KEY = "attendance-default-tab";
const TABS = [
  ["weekday", "Ngày thường"],
  ["evening", "Tối"],
  ["weekend", "T7-CN"],
  ["export-fast", "Export Fast"],
  ["export-early", "Export Sớm"],
  ["export-evening", "Export Tối"],
  ["export-weekend", "Export T7-CN"],
] as const;

// Từ md trở lên trang cao đúng bằng màn hình: đầu trang và các tab đứng yên, chỉ nội dung tab cuộn.
/** Tab có bảng tự cuộn bên trong (để tiêu đề cột dính). */
const PANEL_FILL = "min-w-0 md:min-h-0 md:flex-1 md:overflow-hidden";
/** Tab cuộn cả nội dung. */
const PANEL_SCROLL = "min-w-0 md:min-h-0 md:flex-1 md:overflow-y-auto";

function storedTab(): string {
  const stored = typeof window === "undefined" ? null : localStorage.getItem(TAB_STORAGE_KEY);
  return TABS.some(([value]) => value === stored) ? stored! : "weekday";
}

export function WeekPage({ weekStart }: { weekStart: string }) {
  const me = useMe();
  const catalog = useCatalog();
  const week = useWeek(weekStart);
  const write = useCellWriter(weekStart);
  const applyToWeekdays = useApplyToWeekdays(weekStart);
  const [tab, setTab] = useState(storedTab);

  const canEdit = me.data?.role === "ADMIN" || me.data?.role === "EDITOR";
  const environment = useMemo(
    () => (catalog.data ? { view: buildCatalogView(catalog.data), write, canEdit } : null),
    [catalog.data, write, canEdit],
  );
  const cells = useMemo(() => (week.data ? buildCellMap(week.data) : null), [week.data]);
  const coreMembers = useMemo(
    () => week.data?.members.filter((member) => member.membership === "CORE") ?? [],
    [week.data],
  );

  // Chỉ thay cả trang bằng màn hình lỗi khi chưa tải được gì. Đã có dữ liệu mà lần tải lại sau đó hỏng
  // (chập mạng, máy chủ khởi động lại) thì giữ nguyên bảng và báo ở thông báo nổi.
  const failed = (!me.data && me.error) || (!catalog.data && catalog.error) || (!week.data && week.error) || null;
  if (failed) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm text-destructive">{failed.message}</p>
        <Button type="button" variant="outline" onClick={() => { void me.refetch(); void catalog.refetch(); void week.refetch(); }}>
          Thử lại
        </Button>
      </div>
    );
  }
  if (!me.data || !environment || !week.data || !cells) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Đang tải dữ liệu...</div>;
  }

  const weekdays = week.data.days.slice(0, 5);
  const weekend = week.data.days.slice(5);
  const reloadError = week.error ?? catalog.error;

  return (
    <ScheduleEnvironmentProvider value={environment}>
      <main className="mx-auto flex w-full min-w-0 max-w-full flex-col gap-4 p-4 sm:gap-6 sm:p-6 md:h-dvh md:overflow-hidden lg:p-8">
        <WeekHeader weekStart={weekStart} user={me.data} />
        <Tabs value={tab} className="flex w-full min-w-0 flex-col md:min-h-0 md:flex-1"
          onValueChange={(value) => { localStorage.setItem(TAB_STORAGE_KEY, value); setTab(value); }}>
          <TabsList className="mb-4 flex h-auto w-full shrink-0 flex-wrap justify-start gap-1">
            {TABS.map(([value, label]) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="weekday" className={PANEL_FILL}>
            <ScheduleTable members={coreMembers} dates={weekdays} cells={cells} onApplyWeek={applyToWeekdays} />
          </TabsContent>
          <TabsContent value="evening" className={PANEL_SCROLL}>
            <EveningTab members={week.data.members} dates={weekdays} cells={cells} />
          </TabsContent>
          <TabsContent value="weekend" className={PANEL_FILL}>
            <ScheduleTable members={week.data.members} dates={weekend} cells={cells} />
          </TabsContent>
          <TabsContent value="export-fast" className={PANEL_SCROLL}><ExportPanel type="fast" weekStart={weekStart} /></TabsContent>
          <TabsContent value="export-early" className={PANEL_SCROLL}><ExportPanel type="early" weekStart={weekStart} /></TabsContent>
          <TabsContent value="export-evening" className={PANEL_SCROLL}><ExportPanel type="evening" weekStart={weekStart} /></TabsContent>
          <TabsContent value="export-weekend" className={PANEL_SCROLL}><ExportPanel type="weekend" weekStart={weekStart} /></TabsContent>
        </Tabs>
        <StatusToasts
          staleMessage={reloadError ? reloadError.message : null}
          retrying={week.isFetching || catalog.isFetching}
          onRetry={() => { void week.refetch(); void catalog.refetch(); }}
        />
      </main>
    </ScheduleEnvironmentProvider>
  );
}
