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
