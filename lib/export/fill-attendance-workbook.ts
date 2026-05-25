import {
  type AttendanceExportRow,
} from "@/lib/export/build-attendance-rows";
import { DATA_START_ROW, TEMPLATE_PATH } from "@/lib/export/constants";
import { formatDateForExport } from "@/lib/export/format";

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
