"use client";

import { WeekendExportExcelButton } from "@/components/attendance/weekend-export-excel-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { selectActiveSheet } from "@/lib/attendance/selectors";
import {
  buildWeekendAttendanceRows,
  getWeekendDayLabel,
} from "@/lib/export/build-weekend-attendance-rows";
import { formatTimeHHmm } from "@/lib/export/format";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

function formatTime(parts: { h: number; m: number } | null): string {
  if (!parts) return "—";
  return formatTimeHHmm(parts);
}

export function WeekendExportAttendanceTable() {
  const sheet = useAttendanceZustandStore(selectActiveSheet);

  if (!sheet) return null;

  const rows = buildWeekendAttendanceRows(sheet);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Mỗi dòng là một ngày T7 hoặc CN của một nhân viên.
        </p>
        <WeekendExportExcelButton />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[56px]">Ngày</TableHead>
              <TableHead className="min-w-[80px]">Mã NV</TableHead>
              <TableHead className="min-w-[160px]">Họ và tên</TableHead>
              <TableHead className="min-w-[100px]">Chức danh</TableHead>
              <TableHead className="min-w-[140px]">
                Bắt đầu ca
              </TableHead>
              <TableHead className="min-w-[140px]">
                Kết thúc ca
              </TableHead>
              <TableHead className="min-w-[140px]">
                Công việc
              </TableHead>
              <TableHead className="min-w-[200px]">
                Block
              </TableHead>
              <TableHead className="min-w-[120px]">MST</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-8 text-center text-muted-foreground"
                >
                  Chưa có dòng T7-CN — hãy nhập ca trên tab T7-CN.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${row.employeeId}-${row.dayKey}`}>
                  <TableCell className="font-mono text-xs">
                    {getWeekendDayLabel(row.dayKey)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.employeeId}
                  </TableCell>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell className="text-xs">{row.jobTitle}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatTime(row.assignedStart)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatTime(row.assignedEnd)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.jobDescription}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.locationBlock ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.taxCode}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
