/** Tuần bắt đầu thứ Hai, định danh bằng ngày thứ Hai dạng yyyy-MM-dd. Mọi phép tính dùng giờ địa phương. */

export const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] as const;

export function parseISODate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && toISODate(parseISODate(value)) === value;
}

export function addDays(isoDate: string, days: number): string {
  const date = parseISODate(isoDate);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Thứ Hai của tuần chứa `isoDate`. */
export function weekStartOf(isoDate: string): string {
  const day = parseISODate(isoDate).getDay();
  return addDays(isoDate, day === 0 ? -6 : 1 - day);
}

export function currentWeekStart(): string {
  return weekStartOf(toISODate(new Date()));
}

/** 0 = T2 … 6 = CN. */
export function dayIndex(isoDate: string): number {
  return (parseISODate(isoDate).getDay() + 6) % 7;
}

export function isWeekend(isoDate: string): boolean {
  return dayIndex(isoDate) >= 5;
}

/** "04/05" */
export function formatDayShort(isoDate: string): string {
  const [, m, d] = isoDate.split("-");
  return `${d}/${m}`;
}

/** "T2 04/05" */
export function formatDayHeader(isoDate: string): string {
  return `${DAY_LABELS[dayIndex(isoDate)]} ${formatDayShort(isoDate)}`;
}

/** "T2 04/05 – CN 10/05/2026" */
export function formatWeekRange(weekStart: string): string {
  const sunday = addDays(weekStart, 6);
  return `T2 ${formatDayShort(weekStart)} – CN ${formatDayShort(sunday)}/${sunday.slice(0, 4)}`;
}
