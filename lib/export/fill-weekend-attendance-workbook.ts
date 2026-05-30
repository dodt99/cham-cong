import type { WeekendAttendanceRow } from "@/lib/export/build-weekend-attendance-rows";
import { formatWeekendSheetTitle } from "@/lib/export/format-weekend-day-header";
import { EXCEL_TIME_NUM_FMT, toExcelTimeValue } from "@/lib/export/format";
import {
  WEEKEND_DATA_START_ROW,
  WEEKEND_HEADER_ROW,
  WEEKEND_JOB_DESCRIPTION,
  WEEKEND_JOB_TITLE,
  WEEKEND_SHEET_SAT,
  WEEKEND_SHEET_SUN,
  WEEKEND_TEMPLATE_PATH,
  WEEKEND_UNIT,
} from "@/lib/export/weekend-constants";
import { getDayDate } from "@/lib/utils/week";
import { getWeekendWorkLocationPriority } from "../constants/work-locations";

function updateWeekendSheetTitle(
  sheet: import("exceljs").Worksheet,
  title: string,
): void {
  const row = sheet.getRow(WEEKEND_HEADER_ROW);
  row.getCell(1).value = title;
}

function fillWeekendSheetRows(
  sheet: import("exceljs").Worksheet,
  exportRows: WeekendAttendanceRow[],
): void {
  let rowNum = WEEKEND_DATA_START_ROW;
  for (const row of exportRows) {
    const excelRow = sheet.getRow(rowNum);
    excelRow.getCell(2).value = row.employeeId;
    excelRow.getCell(3).value = row.fullName;
    excelRow.getCell(4).value = WEEKEND_JOB_TITLE;

    if (row.assignedStart) {
      const startCell = excelRow.getCell(7);
      startCell.value = toExcelTimeValue(row.assignedStart);
      startCell.numFmt = EXCEL_TIME_NUM_FMT;
    }
    if (row.assignedEnd) {
      const endCell = excelRow.getCell(8);
      endCell.value = toExcelTimeValue(row.assignedEnd);
      endCell.numFmt = EXCEL_TIME_NUM_FMT;
    }

    excelRow.getCell(9).value = WEEKEND_JOB_DESCRIPTION;

    if (row.locationBlock) {
      excelRow.getCell(10).value = row.locationBlock;
    }

    excelRow.getCell(11).value = row.taxCode;
    excelRow.getCell(12).value = WEEKEND_UNIT;

    excelRow.commit();
    rowNum += 1;
  }
}

export async function fillAndDownloadWeekendAttendanceExcel(
  exportRows: WeekendAttendanceRow[],
  weekStart: string,
): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;

  const response = await fetch(WEEKEND_TEMPLATE_PATH);
  if (!response.ok) {
    throw new Error("Không tải được file mẫu Excel T7-CN.");
  }

  const buffer = await response.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const satSheet = workbook.getWorksheet(WEEKEND_SHEET_SAT);
  const sunSheet = workbook.getWorksheet(WEEKEND_SHEET_SUN);
  if (!satSheet || !sunSheet) {
    throw new Error("File mẫu Excel T7-CN thiếu sheet T7 hoặc CN.");
  }

  const satDate = getDayDate(weekStart, "sat");
  const sunDate = getDayDate(weekStart, "sun");
  updateWeekendSheetTitle(
    satSheet,
    formatWeekendSheetTitle("sat", satDate),
  );
  updateWeekendSheetTitle(
    sunSheet,
    formatWeekendSheetTitle("sun", sunDate),
  );

  const satRows = exportRows.filter((r) => r.dayKey === "sat").sort((a, b) => getWeekendWorkLocationPriority(a.locationBlock) - getWeekendWorkLocationPriority(b.locationBlock));
  const sunRows = exportRows.filter((r) => r.dayKey === "sun").sort((a, b) => getWeekendWorkLocationPriority(a.locationBlock) - getWeekendWorkLocationPriority(b.locationBlock));

  fillWeekendSheetRows(satSheet, satRows);
  fillWeekendSheetRows(sunSheet, sunRows);

  const outBuffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([outBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `T7-CN-${weekStart}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
