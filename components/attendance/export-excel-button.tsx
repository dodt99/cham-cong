"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAttendanceRows } from "@/lib/export/build-attendance-rows";
import { fillAndDownloadAttendanceExcel } from "@/lib/export/fill-attendance-workbook";
import type { WeekSheet } from "@/lib/types/attendance";

type ExportExcelButtonProps = {
  sheet: WeekSheet | null;
};

export function ExportExcelButton({ sheet }: ExportExcelButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!sheet) return;

    setExporting(true);
    try {
      const rows = buildAttendanceRows(sheet);
      await fillAndDownloadAttendanceExcel(rows, sheet.weekStart);
    } catch (error) {
      console.error(error);
      window.alert("Xuất Excel thất bại. Vui lòng thử lại.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={!sheet || exporting}
      onClick={handleExport}
    >
      <Download className="size-4" />
      {exporting ? "Đang xuất..." : "Xuất Excel"}
    </Button>
  );
}
