import type { EarlyAttendanceRow } from "@/lib/export/build-early-attendance-rows";
import {
  EARLY_DATA_START_ROW,
  EARLY_HEADER_ROW,
  EARLY_TEMPLATE_PATH,
} from "@/lib/export/early-constants";
import { formatEarlyWeekHeader } from "@/lib/export/format-early-week-header";
import { toExcelTimeValue } from "@/lib/export/format";

function parseDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function updateEarlyWeekHeader(
  sheet: import("exceljs").Worksheet,
  weekStart: string,
): void {
  const label = formatEarlyWeekHeader(weekStart);
  const cell = sheet.getRow(EARLY_HEADER_ROW).getCell(1);
  cell.value = label;
}

export async function fillAndDownloadEarlyAttendanceExcel(
  exportRows: EarlyAttendanceRow[],
  weekStart: string,
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;

  const response = await fetch(EARLY_TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error("Không tải được file mẫu Excel làm sớm.");
  }

  const buffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error("File mẫu Excel không có worksheet.");
  }

  updateEarlyWeekHeader(sheet, weekStart);

  let rowNum = EARLY_DATA_START_ROW;
  for (const row of exportRows) {
    const excelRow = sheet.getRow(rowNum);
    excelRow.getCell(2).value = row.employeeId;
    excelRow.getCell(3).value = row.fullName;
    excelRow.getCell(4).value = parseDate(row.workDate);

    if (row.assignedStart) {
      excelRow.getCell(8).value = toExcelTimeValue(row.assignedStart);
    }
    excelRow.getCell(9).value = row.assignedEnd
      ? toExcelTimeValue(row.assignedEnd)
      : null;

    excelRow.getCell(12).value = row.jobTitle;

    if (row.locationBlock) {
      excelRow.getCell(13).value = row.locationBlock;
    }

    excelRow.getCell(14).value = row.taxCode;

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
  link.download = `Lam-som-${weekStart}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
