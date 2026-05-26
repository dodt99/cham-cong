import {
  type AttendanceExportRow,
} from "@/lib/export/build-attendance-rows";
import {
  DATA_START_ROW,
  EXPORT_JOB_CODE,
  OFF_LABEL,
  TEMPLATE_PATH,
  WEEKEND_DATE_FILL_ARGB,
} from "@/lib/export/constants";
import {
  formatDateForExport,
  isWeekendExportRow,
} from "@/lib/export/format";
import type { Cell, Fill } from "exceljs";

const WEEKEND_DATE_FILL: Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: WEEKEND_DATE_FILL_ARGB },
};

function applyWeekendDateCellFill(cell: Cell): void {
  cell.style = { ...cell.style, fill: WEEKEND_DATE_FILL };
}

export async function fillAndDownloadAttendanceExcel(
  exportRows: AttendanceExportRow[],
  weekStart: string,
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;

  const response = await fetch(TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error("Không tải được file mẫu Excel.");
  }

  const buffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error("File mẫu Excel không có worksheet.");
  }

  let rowNum = DATA_START_ROW;
  for (const row of exportRows) {
    const excelRow = sheet.getRow(rowNum);
    excelRow.getCell(1).value = row.employeeId;
    excelRow.getCell(2).value = row.fullName;
    excelRow.getCell(3).value = formatDateForExport(row.fromDate);
    excelRow.getCell(4).value = formatDateForExport(row.toDate);
    excelRow.getCell(5).value = row.shiftLabel;

    if (row.shiftLabel !== OFF_LABEL) {
      excelRow.getCell(7).value = EXPORT_JOB_CODE;
    }

    if (row.locationCode) {
      excelRow.getCell(9).value = row.locationCode;
    }

    if (row.note) {
      excelRow.getCell(10).value = row.note;
    }

    if (isWeekendExportRow(row.fromDate, row.toDate)) {
      applyWeekendDateCellFill(excelRow.getCell(3));
      applyWeekendDateCellFill(excelRow.getCell(4));
    }

    excelRow.commit();
    rowNum += 1;
  }

  const outBuffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([outBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Ca-lam-viec-${weekStart}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
