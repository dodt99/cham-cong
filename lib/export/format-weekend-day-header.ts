import type { WeekendDayKey } from "@/lib/export/build-weekend-attendance-rows";

function parseDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateDdMYYYY(isoDate: string): string {
  const date = parseDate(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Sheet row 1 title, e.g. "KHÁM CHỮA BỆNH THỨ 7 NGÀY 09/5/2026". */
export function formatWeekendSheetTitle(
  dayKey: WeekendDayKey,
  isoDate: string,
): string {
  const dateLabel = formatDateDdMYYYY(isoDate);
  if (dayKey === "sat") {
    return `KHÁM CHỮA BỆNH THỨ 7 NGÀY ${dateLabel}`;
  }
  return `KHÁM CHỮA BỆNH CHỦ NHẬT NGÀY ${dateLabel}`;
}
