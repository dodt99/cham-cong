"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  selectActiveSheet,
  selectHasActiveSheet,
} from "@/lib/attendance/selectors";
import { buildAttendanceRows } from "@/lib/export/build-attendance-rows";
import { fillAndDownloadAttendanceExcel } from "@/lib/export/fill-attendance-workbook";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function ExportExcelButton() {
  const [exporting, setExporting] = useState(false);
  const canExport = useAttendanceZustandStore(selectHasActiveSheet);

  async function handleExport() {
    const sheet = selectActiveSheet(useAttendanceZustandStore.getState());
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
      disabled={!canExport || exporting}
      onClick={handleExport}
    >
      <Download className="size-4" />
      {exporting ? "Đang xuất..." : "Xuất Excel"}
    </Button>
  );
}
