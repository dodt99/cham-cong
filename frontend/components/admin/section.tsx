"use client";

import type { ReactNode } from "react";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Column<T> = { header: string; cell: (row: T) => ReactNode; className?: string };

/** Khung chung của một mục quản trị: mô tả, nút thêm, bảng có nút sửa từng dòng. */
export function AdminSection<T>({
  description,
  addLabel,
  rows,
  rowKey,
  columns,
  isDimmed,
  loading,
  error,
  onAdd,
  onEdit,
}: {
  description: string;
  addLabel: string;
  rows: T[] | undefined;
  rowKey: (row: T) => number;
  columns: Column<T>[];
  /** Dòng đã ngừng dùng hiện mờ. */
  isDimmed?: (row: T) => boolean;
  loading: boolean;
  error: Error | null;
  onAdd: () => void;
  onEdit: (row: T) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        <Button type="button" onClick={onAdd}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="py-8 text-center text-sm text-destructive">{error.message}</p>
      ) : loading || !rows ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Đang tải…</p>
      ) : (
        <div className="min-w-0 max-w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.header} className={cn("whitespace-nowrap", column.className)}>
                    {column.header}
                  </TableHead>
                ))}
                <TableHead className="w-[1%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={rowKey(row)} className={cn(isDimmed?.(row) && "text-muted-foreground")}>
                  {columns.map((column) => (
                    <TableCell key={column.header} className={cn("whitespace-nowrap text-sm", column.className)}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button type="button" variant="ghost" size="icon" aria-label="Sửa" onClick={() => onEdit(row)}>
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export const yesNo = (value: boolean) => (value ? "✓" : "—");
