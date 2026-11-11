"use client";

import { useMemo, useState } from "react";

import { EveningTab } from "@/components/schedule/evening-tab";
import { ExportPanel } from "@/components/schedule/export-panel";
import { ScheduleEnvironmentProvider } from "@/components/schedule/schedule-context";
import { ScheduleTable } from "@/components/schedule/schedule-table";
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

  const failed = me.error ?? catalog.error ?? week.error;
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

  return (
    <ScheduleEnvironmentProvider value={environment}>
      <main className="mx-auto flex w-full min-w-0 max-w-full flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
        <WeekHeader weekStart={weekStart} user={me.data} />
        <Tabs value={tab} className="w-full min-w-0"
          onValueChange={(value) => { localStorage.setItem(TAB_STORAGE_KEY, value); setTab(value); }}>
          <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
            {TABS.map(([value, label]) => (
              <TabsTrigger key={value} value={value}>{label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="weekday" className="min-w-0">
            <ScheduleTable members={coreMembers} dates={weekdays} cells={cells} onApplyWeek={applyToWeekdays} />
          </TabsContent>
          <TabsContent value="evening" className="min-w-0">
            <EveningTab members={week.data.members} dates={weekdays} cells={cells} />
          </TabsContent>
          <TabsContent value="weekend" className="min-w-0">
            <ScheduleTable members={week.data.members} dates={weekend} cells={cells} />
          </TabsContent>
          <TabsContent value="export-fast" className="min-w-0"><ExportPanel type="fast" weekStart={weekStart} /></TabsContent>
          <TabsContent value="export-early" className="min-w-0"><ExportPanel type="early" weekStart={weekStart} /></TabsContent>
          <TabsContent value="export-evening" className="min-w-0"><ExportPanel type="evening" weekStart={weekStart} /></TabsContent>
          <TabsContent value="export-weekend" className="min-w-0"><ExportPanel type="weekend" weekStart={weekStart} /></TabsContent>
        </Tabs>
      </main>
    </ScheduleEnvironmentProvider>
  );
}
