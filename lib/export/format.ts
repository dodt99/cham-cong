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

/** Excel time-only cell (1899-12-30 base date). */
export function toExcelTimeValue(parts: ShiftTime): Date {
  return new Date(1899, 11, 30, parts.h, parts.m, 0, 0);
}
