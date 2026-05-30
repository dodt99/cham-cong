"use client";

import { ExportExcelButton } from "@/components/attendance/export-excel-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { selectActiveSheet } from "@/lib/attendance/selectors";
import { buildAttendanceRows } from "@/lib/export/build-attendance-rows";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function ExportPreviewTable() {
  const sheet = useAttendanceZustandStore(selectActiveSheet);

  if (!sheet) return null;

  const rows = buildAttendanceRows(sheet);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Bảng Fast chấm công hàng ngày
        </p>
        <ExportExcelButton />
      </div>
      <div className="min-w-0 max-w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">Mã NV</TableHead>
              <TableHead className="min-w-[160px]">Họ và tên</TableHead>
              <TableHead className="min-w-[120px]">Từ ngày</TableHead>
              <TableHead className="min-w-[120px]">Đến ngày</TableHead>
              <TableHead className="min-w-[100px]">Ca</TableHead>
              <TableHead className="min-w-[120px]">Mã vị trí</TableHead>
              <TableHead className="min-w-[100px]">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-muted-foreground"
                >
                  Chưa có dòng export — hãy nhập ca trên các tab khác.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={`${row.employeeId}-${row.fromDate}-${row.shiftLabel}-${index}`}
                >
                  <TableCell className="font-mono text-xs">
                    {row.employeeId}
                  </TableCell>
                  <TableCell>{row.fullName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.fromDate}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.toDate}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.shiftLabel}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.locationCode ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">{row.note ?? ""}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
