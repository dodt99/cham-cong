"use client";

import { memo } from "react";
import { ChevronDown } from "lucide-react";

import {
  AttendanceDayFields,
  AttendanceDefaultFields,
} from "@/components/attendance/attendance-table-cells";
import { AttendanceEmployeeSummary } from "@/components/attendance/attendance-employee-summary";
import {
  Collapsible,
  CollapsibleContentPanel,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DEFAULT_SELECT_TONE_CLASS,
  getDaySelectToneClass,
} from "@/lib/attendance/column-colors";
import type { Employee } from "@/lib/constants/employees";
import type { DayKey } from "@/lib/types/attendance";
import { formatDayHeader } from "@/lib/utils/week";

type AttendanceEmployeeMobileCardProps = {
  employee: Employee;
  weekStart: string;
  dayKeys: readonly DayKey[];
  showDefaultColumn?: boolean;
  colorizeColumns?: boolean;
  isOpen: boolean;
  onOpenChange: (employeeId: string, open: boolean) => void;
};

function AttendanceEmployeeMobileCardInner({
  employee,
  weekStart,
  dayKeys,
  showDefaultColumn = true,
  colorizeColumns = false,
  isOpen,
  onOpenChange,
}: AttendanceEmployeeMobileCardProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => onOpenChange(employee.id, open)}
      className="rounded-md border bg-background"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-start gap-2 p-3 text-left [&[data-state=open]>svg]:rotate-180"
        >
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-mono text-xs text-muted-foreground">
                {employee.id}
              </span>
              <span className="text-sm font-medium break-words">
                {employee.fullName}
              </span>
            </div>
            <AttendanceEmployeeSummary
              employeeId={employee.id}
              dayKeys={dayKeys}
            />
          </div>
          <ChevronDown
            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200"
            aria-hidden
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContentPanel className="border-t border-dashed px-3 pb-3 pt-2">
        <div className="flex flex-col gap-3">
          {showDefaultColumn && (
            <section className="space-y-1.5">
              <h4 className="text-xs font-semibold text-muted-foreground">
                Mặc định
              </h4>
              <AttendanceDefaultFields
                employeeId={employee.id}
                layout="row"
                selectToneClassName={
                  colorizeColumns ? DEFAULT_SELECT_TONE_CLASS : undefined
                }
              />
            </section>
          )}
          {dayKeys.map((day) => (
            <section key={day} className="space-y-1.5">
              <h4 className="text-xs font-semibold">
                {formatDayHeader(weekStart, day)}
              </h4>
              <AttendanceDayFields
                employeeId={employee.id}
                day={day}
                align="start"
                layout="row"
                selectToneClassName={
                  colorizeColumns ? getDaySelectToneClass(day) : undefined
                }
              />
            </section>
          ))}
        </div>
      </CollapsibleContentPanel>
    </Collapsible>
  );
}

export const AttendanceEmployeeMobileCard = memo(
  AttendanceEmployeeMobileCardInner,
);
