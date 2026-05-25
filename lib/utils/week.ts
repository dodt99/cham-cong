import { DAY_KEYS, DAY_LABELS, type DayKey } from "@/lib/types/attendance";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Monday of the week containing `date` (local time). */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

export function getCurrentWeekStart(): string {
  return getWeekStart(new Date());
}

export function addDays(isoDate: string, days: number): string {
  const d = parseDate(isoDate);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function formatDayShort(isoDate: string): string {
  const d = parseDate(isoDate);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

export function formatWeekRange(weekStart: string): string {
  const end = addDays(weekStart, 4);
  const startLabel = formatDayShort(weekStart);
  const endLabel = formatDayShort(end);
  const year = parseDate(end).getFullYear();
  return `T2 ${startLabel} – T6 ${endLabel}/${year}`;
}

export function getDayDate(weekStart: string, day: DayKey): string {
  const index = DAY_KEYS.indexOf(day);
  return addDays(weekStart, index);
}

export function formatDayHeader(weekStart: string, day: DayKey): string {
  return `${DAY_LABELS[day]} ${formatDayShort(getDayDate(weekStart, day))}`;
}

export function buildWeekOptions(
  aroundDate: Date = new Date(),
  pastWeeks = 4,
  futureWeeks = 4,
): string[] {
  const current = getWeekStart(aroundDate);
  const options: string[] = [];
  for (let i = -pastWeeks; i <= futureWeeks; i++) {
    const d = parseDate(current);
    d.setTime(d.getTime() + i * 7 * DAY_MS);
    options.push(toISODate(d));
  }
  return options;
}

export function sortWeekStarts(weekStarts: string[]): string[] {
  return [...weekStarts].sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());
}
