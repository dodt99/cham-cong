"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api/client";
import type { ExportType } from "@/lib/api/types";
import { useExportPreview } from "@/lib/schedule/queries";

const DESCRIPTIONS: Record<ExportType, string> = {
  fast: "File Fast — đăng ký ca làm việc hằng ngày",
  early: "File thanh toán đi làm sớm (T2→T6)",
  evening: "File thanh toán làm ngoài giờ buổi tối (T2→T6)",
  weekend: "File thanh toán khám chữa bệnh thứ 7, chủ nhật",
};

/** Xem trước đúng những dòng sẽ nằm trong file Excel (cùng một nguồn ở máy chủ) và nút tải file. */
export function ExportPanel({ type, weekStart }: { type: ExportType; weekStart: string }) {
  const preview = useExportPreview(type, weekStart);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{DESCRIPTIONS[type]}</p>
        <Button asChild>
          <a href={api.exportFileUrl(type, weekStart)} download={preview.data?.fileName}>
            <Download className="size-4" />
            Xuất Excel
          </a>
        </Button>
      </div>

      {preview.isPending ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Đang tải bản xem trước…</p>
      ) : preview.isError ? (
        <p role="alert" className="py-8 text-center text-sm text-destructive">
          Không tải được bản xem trước. {preview.error.message}
        </p>
      ) : (
        preview.data.sheets.map((sheet) => (
          <section key={sheet.name} className="flex min-w-0 flex-col gap-2">
            {(preview.data.sheets.length > 1 || sheet.title) && (
              <h3 className="text-sm font-semibold">
                {preview.data.sheets.length > 1 && <span className="mr-2 rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">{sheet.name}</span>}
                {sheet.title}
              </h3>
            )}
            <div className="min-w-0 max-w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {sheet.columns.map((column) => (
                      <TableHead key={column} className="whitespace-nowrap">{column}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sheet.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={sheet.columns.length} className="py-8 text-center text-muted-foreground">
                        Chưa có dòng nào — hãy nhập ca trên các tab khác.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sheet.rows.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((value, columnIndex) => (
                          <TableCell key={columnIndex} className="whitespace-nowrap text-sm">{value}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
