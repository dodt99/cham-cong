"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { ChevronDown, CopyCheck, Search } from "lucide-react";

import { ApplyWeekDialog } from "@/components/schedule/apply-week-dialog";
import { DayFields } from "@/components/schedule/day-fields";
import { useScheduleEnvironment } from "@/components/schedule/schedule-context";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContentPanel, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BulkMode, CellContent, Member } from "@/lib/api/types";
import { getDaySelectToneClass, WEEK_ACTION_TONE_CLASS } from "@/lib/schedule/day-colors";
import { type CellMap, cellKey } from "@/lib/schedule/model";
import { filterMembers } from "@/lib/search";
import { cn } from "@/lib/utils";
import { DAY_LABELS, dayIndex, formatDayHeader } from "@/lib/week";

type ScheduleTableProps = {
  members: Member[];
  /** Các ngày hiển thị thành cột (T2→T6 hoặc T7, CN). */
  dates: string[];
  cells: CellMap;
  /** Truyền vào để có cột "Cả tuần" (chỉ tab Ngày thường). */
  onApplyWeek?: (employeeId: number, content: CellContent, mode: BulkMode) => Promise<void>;
};

const mainCell = (cells: CellMap, employeeId: number, date: string) =>
  cells.get(cellKey({ employeeId, date, slot: "MAIN" }));

/** Bảng xếp ca theo nhân viên × ngày: bảng trên máy tính, danh sách thẻ thu gọn trên điện thoại. */
export function ScheduleTable({ members, dates, cells, onApplyWeek }: ScheduleTableProps) {
  const { canEdit } = useScheduleEnvironment();
  const [search, setSearch] = useState("");
  const [applyingTo, setApplyingTo] = useState<Member | null>(null);
  const [openEmployeeId, setOpenEmployeeId] = useState<number | null>(null);
  const visible = useMemo(() => filterMembers(members, search), [members, search]);
  const showWeekColumn = Boolean(onApplyWeek) && canEdit;
  const openApply = useCallback((member: Member) => setApplyingTo(member), []);
  const toggleCard = useCallback(
    (employeeId: number, open: boolean) => setOpenEmployeeId(open ? employeeId : null),
    [],
  );

  return (
    <>
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm mã, tên nhân viên..."
          aria-label="Tìm nhân viên"
          className="flex h-9 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy nhân viên phù hợp.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2 md:hidden">
            {visible.map((member) => (
              <li key={member.employeeId}>
                <MemberCard member={member} dates={dates} cells={cells} isOpen={openEmployeeId === member.employeeId}
                  onOpenChange={toggleCard} onApplyWeek={showWeekColumn ? openApply : undefined} />
              </li>
            ))}
          </ul>

          <div className="hidden min-w-0 max-w-full rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-20 min-w-[60px] bg-background">Mã NV</TableHead>
                  <TableHead className="sticky left-[60px] z-20 min-w-[130px] bg-background shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    Họ và tên
                  </TableHead>
                  {showWeekColumn && <TableHead className="w-[1%] text-center">Cả tuần</TableHead>}
                  {dates.map((date) => (
                    <TableHead key={date} className="min-w-[180px] text-center">
                      {formatDayHeader(date)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((member) => (
                  <MemberRow key={member.employeeId} member={member} dates={dates} cells={cells}
                    onApplyWeek={showWeekColumn ? openApply : undefined} />
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {onApplyWeek && (
        <ApplyWeekDialog
          member={applyingTo}
          filledDays={applyingTo ? dates.filter((date) => mainCell(cells, applyingTo.employeeId, date)).length : 0}
          onApply={onApplyWeek}
          onClose={() => setApplyingTo(null)}
        />
      )}
    </>
  );
}

type MemberRowProps = {
  member: Member;
  dates: string[];
  cells: CellMap;
  onApplyWeek?: (member: Member) => void;
};

function MemberRow({ member, dates, cells, onApplyWeek }: MemberRowProps) {
  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 bg-background font-mono text-xs">{member.code}</TableCell>
      <TableCell className="sticky left-[60px] z-10 bg-background font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
        {member.fullName}
      </TableCell>
      {onApplyWeek && (
        <TableCell className="align-top">
          <ApplyWeekButton member={member} onApplyWeek={onApplyWeek} />
        </TableCell>
      )}
      {dates.map((date) => (
        <TableCell key={date} className="align-top">
          <DayFields
            employeeId={member.employeeId}
            date={date}
            assignment={mainCell(cells, member.employeeId, date)}
            className="mx-auto min-w-[150px] max-w-[200px] px-2"
            toneClassName={getDaySelectToneClass(date)}
          />
        </TableCell>
      ))}
    </TableRow>
  );
}

const ApplyWeekButton = memo(function ApplyWeekButton({
  member,
  onApplyWeek,
}: {
  member: Member;
  onApplyWeek: (member: Member) => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      title="Áp cùng ca và địa điểm cho T2→T6"
      className={cn("h-9 gap-1.5 whitespace-nowrap", WEEK_ACTION_TONE_CLASS)}
      onClick={() => onApplyWeek(member)}
    >
      <CopyCheck className="size-4" />
      Áp cả tuần
    </Button>
  );
});

type MemberCardProps = MemberRowProps & {
  isOpen: boolean;
  onOpenChange: (employeeId: number, open: boolean) => void;
};

function MemberCard({ member, dates, cells, isOpen, onOpenChange, onApplyWeek }: MemberCardProps) {
  const { view } = useScheduleEnvironment();
  return (
    <Collapsible open={isOpen} onOpenChange={(open) => onOpenChange(member.employeeId, open)}
      className="rounded-md border bg-background">
      <CollapsibleTrigger asChild>
        <button type="button" className="flex w-full items-start gap-2 p-3 text-left [&[data-state=open]>svg]:rotate-180">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-mono text-xs text-muted-foreground">{member.code}</span>
              <span className="break-words text-sm font-medium">{member.fullName}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {dates.map((date) => {
                const assignment = mainCell(cells, member.employeeId, date);
                const shift = assignment?.shiftId ? view.shiftById.get(assignment.shiftId) : undefined;
                return (
                  <span key={date} className={cn(
                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none",
                    shift ? "bg-secondary text-secondary-foreground" : "bg-muted/60 text-muted-foreground")}>
                    <span>{DAY_LABELS[dayIndex(date)]}</span>
                    <span className={cn(!shift && "opacity-70")}>{shift ? shift.code : "—"}</span>
                  </span>
                );
              })}
            </div>
          </div>
          <ChevronDown className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200" aria-hidden />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContentPanel className="border-t border-dashed px-3 pb-3 pt-2">
        <div className="flex flex-col gap-3">
          {onApplyWeek && <ApplyWeekButton member={member} onApplyWeek={onApplyWeek} />}
          {dates.map((date) => (
            <section key={date} className="space-y-1.5">
              <h4 className="text-xs font-semibold">{formatDayHeader(date)}</h4>
              <DayFields employeeId={member.employeeId} date={date}
                assignment={mainCell(cells, member.employeeId, date)} layout="row"
                toneClassName={getDaySelectToneClass(date)} />
            </section>
          ))}
        </div>
      </CollapsibleContentPanel>
    </Collapsible>
  );
}
