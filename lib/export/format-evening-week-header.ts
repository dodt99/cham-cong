import { addDays } from "@/lib/utils/week";

function parseDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateDdMmYyyy(isoDate: string): string {
  const date = parseDate(isoDate);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Template row 3 label, e.g. "TỪ 04/05/2026 ĐẾN 08/05/2026" (Mon–Fri). */
export function formatEveningWeekHeader(weekStart: string): string {
  const fri = addDays(weekStart, 4);
  return `TỪ ${formatDateDdMmYyyy(weekStart)} ĐẾN ${formatDateDdMmYyyy(fri)}`;
}
