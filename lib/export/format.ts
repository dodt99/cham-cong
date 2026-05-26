import type { ShiftTime } from "@/lib/constants/shifts";

function parseDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** True when export row is a single Sat/Sun day (T7/CN). */
export function isWeekendExportRow(fromDate: string, toDate: string): boolean {
  if (fromDate !== toDate) return false;
  const dow = parseDate(fromDate).getDay();
  return dow === 0 || dow === 6;
}

/** Excel date cell (UTC midnight) — pair with numFmt `dd/mm/yyyy`. */
export function toExcelDateValue(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export const EXCEL_DATE_NUM_FMT = "dd/mm/yyyy";

/** Excel export date format: dd/MM/yyyy */
export function formatDateForExport(isoDate: string): string {
  const d = parseDate(isoDate);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatTimeHHmm(parts: ShiftTime): string {
  return `${String(parts.h).padStart(2, "0")}:${String(parts.m).padStart(2, "0")}`;
}

export const EXCEL_TIME_NUM_FMT = "hh:mm";

/** Excel time as day-fraction serial (avoids local timezone skew on 1899 dates). */
export function toExcelTimeValue(parts: ShiftTime): number {
  return (parts.h * 60 + parts.m) / (24 * 60);
}
