import type { EveningAttendanceRow } from "@/lib/export/build-evening-attendance-rows";
import {
  EVENING_DATA_START_ROW,
  EVENING_JOB_DESCRIPTION,
  EVENING_JOB_TITLE,
  EVENING_SHEET_NAME,
  EVENING_TEMPLATE_PATH,
  EVENING_UNIT,
  EVENING_WEEK_HEADER_COL,
  EVENING_WEEK_HEADER_ROW,
} from "@/lib/export/evening-constants";
import { formatEveningWeekHeader } from "@/lib/export/format-evening-week-header";
import {
  EXCEL_DATE_NUM_FMT,
  EXCEL_TIME_NUM_FMT,
  toExcelDateValue,
  toExcelTimeValue,
} from "@/lib/export/format";

function updateEveningWeekHeader(
  sheet: import("exceljs").Worksheet,
  weekStart: string,
): void {
  const label = formatEveningWeekHeader(weekStart);
  sheet.getRow(EVENING_WEEK_HEADER_ROW).getCell(EVENING_WEEK_HEADER_COL).value =
    label;
}

export async function fillAndDownloadEveningAttendanceExcel(
  exportRows: EveningAttendanceRow[],
  weekStart: string,
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;

  const response = await fetch(EVENING_TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error("Không tải được file mẫu Excel ca tối.");
  }

  const buffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.getWorksheet(EVENING_SHEET_NAME);
  if (!sheet) {
    throw new Error("File mẫu Excel ca tối thiếu sheet Sheet1.");
  }

  updateEveningWeekHeader(sheet, weekStart);

  let rowNum = EVENING_DATA_START_ROW;
  for (const row of exportRows) {
    const excelRow = sheet.getRow(rowNum);
    excelRow.getCell(2).value = row.employeeId;
    excelRow.getCell(3).value = row.fullName;

    const workDateCell = excelRow.getCell(4);
    workDateCell.value = toExcelDateValue(row.workDate);
    workDateCell.numFmt = EXCEL_DATE_NUM_FMT;

    excelRow.getCell(5).value = EVENING_JOB_TITLE;

    if (row.assignedStart) {
      const startCell = excelRow.getCell(8);
      startCell.value = toExcelTimeValue(row.assignedStart);
      startCell.numFmt = EXCEL_TIME_NUM_FMT;
    }
    if (row.assignedEnd) {
      const endCell = excelRow.getCell(9);
      endCell.value = toExcelTimeValue(row.assignedEnd);
      endCell.numFmt = EXCEL_TIME_NUM_FMT;
    }

    excelRow.getCell(10).value = EVENING_JOB_DESCRIPTION;

    if (row.locationBlock) {
      excelRow.getCell(11).value = row.locationBlock;
    }

    excelRow.getCell(12).value = row.taxCode;
    excelRow.getCell(13).value = EVENING_UNIT;

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
  link.download = `Lam-toi-${weekStart}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
