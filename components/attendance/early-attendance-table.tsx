"use client";

import { EarlyExportExcelButton } from "@/components/attendance/early-export-excel-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { selectActiveSheet } from "@/lib/attendance/selectors";
import { buildEarlyAttendanceRows } from "@/lib/export/build-early-attendance-rows";
import { formatDateForExport, formatTimeHHmm } from "@/lib/export/format";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

function formatTime(parts: { h: number; m: number } | null): string {
  if (!parts) return "—";
  return formatTimeHHmm(parts);
}

export function EarlyAttendanceTable() {
  const sheet = useAttendanceZustandStore(selectActiveSheet);

  if (!sheet) return null;

  const rows = buildEarlyAttendanceRows(sheet);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Thanh toán làm sớm</p>
        <EarlyExportExcelButton />
      </div>
      <div className="min-w-0 max-w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">Mã NV</TableHead>
              <TableHead className="min-w-[200px]">Họ và tên</TableHead>
              <TableHead className="min-w-[120px]">Chức danh</TableHead>
              <TableHead className="min-w-[150px]">Ngày làm</TableHead>
              <TableHead className="min-w-[140px]">Bắt đầu ca</TableHead>
              <TableHead className="min-w-[140px]">Kết thúc ca</TableHead>
              <TableHead className="min-w-[180px]">Công việc</TableHead>
              <TableHead className="min-w-[150px]">Địa điểm</TableHead>
              <TableHead className="min-w-[120px]">MST</TableHead>
              <TableHead className="min-w-[120px]">Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-muted-foreground"
                >
                  Chưa có dòng làm sớm — hãy nhập ca trên tab Ngày thường.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={`${row.employeeId}-${row.workDate}`}>
                  <TableCell className="font-mono text-xs">
                    {row.employeeId}
                  </TableCell>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell>{row.jobPosition}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatDateForExport(row.workDate)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatTime(row.assignedStart)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatTime(row.assignedEnd)}
                  </TableCell>
                  <TableCell className="text-xs">{row.jobTitle}</TableCell>
                  <TableCell className="text-xs">
                    {row.locationBlock ?? "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.taxCode}
                  </TableCell>
                  <TableCell className="text-xs">{row.note}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
