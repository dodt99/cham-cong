import type { EarlyAttendanceRow } from "@/lib/export/build-early-attendance-rows";
import {
  EARLY_DATA_START_ROW,
  EARLY_HEADER_ROW,
  EARLY_TEMPLATE_PATH,
} from "@/lib/export/early-constants";
import { formatEarlyWeekHeader } from "@/lib/export/format-early-week-header";
import {
  EXCEL_DATE_NUM_FMT,
  EXCEL_TIME_NUM_FMT,
  toExcelDateValue,
  toExcelTimeValue,
} from "@/lib/export/format";

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
    const workDateCell = excelRow.getCell(4);
    workDateCell.value = toExcelDateValue(row.workDate);
    workDateCell.numFmt = EXCEL_DATE_NUM_FMT;

    if (row.assignedStart) {
      const startCell = excelRow.getCell(8);
      startCell.value = toExcelTimeValue(row.assignedStart);
      startCell.numFmt = EXCEL_TIME_NUM_FMT;
    }
    const endCell = excelRow.getCell(9);
    endCell.value = row.assignedEnd
      ? toExcelTimeValue(row.assignedEnd)
      : null;
    if (row.assignedEnd) {
      endCell.numFmt = EXCEL_TIME_NUM_FMT;
    }

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
