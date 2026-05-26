"use client";

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
import { AFTERNOON_OFF_LABEL } from "@/lib/constants/shifts";
import { EVENING_SHIFT_CODE, OFF_LABEL } from "@/lib/export/constants";
import { useAttendanceZustandStore } from "@/stores/attendance-store";
import { cn } from "@/lib/utils";

export function ExportPreviewTable() {
  const sheet = useAttendanceZustandStore(selectActiveSheet);

  if (!sheet) return null;

  const rows = buildAttendanceRows(sheet);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Đây là dữ liệu sẽ ghi vào Excel khi bấm Xuất file.
      </p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[80px]">Mã NV</TableHead>
              <TableHead className="min-w-[160px]">Họ và tên</TableHead>
              <TableHead className="min-w-[100px]">Từ ngày</TableHead>
              <TableHead className="min-w-[100px]">Đến ngày</TableHead>
              <TableHead className="min-w-[80px]">Ca</TableHead>
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
                  className={cn(
                    row.shiftLabel === OFF_LABEL && "bg-muted/40",
                    row.shiftLabel === EVENING_SHIFT_CODE &&
                    "bg-amber-50/80 dark:bg-amber-950/30",
                    row.note === AFTERNOON_OFF_LABEL &&
                    "bg-sky-50/80 dark:bg-sky-950/30",
                  )}
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
                  <TableCell className="text-xs">
                    {row.note ?? ""}
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
