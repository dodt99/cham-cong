import { addDays } from "@/lib/utils/week";

function parseDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDayOfMonth(isoDate: string): string {
  return String(parseDate(isoDate).getDate()).padStart(2, "0");
}

/** Template row 3 label, e.g. "NGÀY 04-08/5/2026" (Mon–Fri of the week). */
export function formatEarlyWeekHeader(weekStart: string): string {
  const fri = addDays(weekStart, 4);
  const endDate = parseDate(fri);
  const month = endDate.getMonth() + 1;
  const year = endDate.getFullYear();
  return `NGÀY ${formatDayOfMonth(weekStart)}-${formatDayOfMonth(fri)}/${month}/${year}`;
}
