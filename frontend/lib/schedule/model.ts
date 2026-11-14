import type { Assignment, Catalog, CellContent, CellRef, Shift, WeekView, WorkLocation } from "@/lib/api/types";

export function cellKey(ref: CellRef): string {
  return `${ref.employeeId}|${ref.date}|${ref.slot}`;
}

export type CellMap = ReadonlyMap<string, Assignment>;

export function buildCellMap(week: WeekView): CellMap {
  return new Map(week.assignments.map((assignment) => [cellKey(assignment), assignment]));
}

/** "06:00:00" → "6h00" */
function formatClock(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${Number(hours)}h${minutes}`;
}

/** Khung giờ của ca, viết như v1: "6h00-16h30". */
export function shiftHours(shift: Shift): string {
  return `${formatClock(shift.startTime)}-${formatClock(shift.endTime)}`;
}

export type ShiftGroup = { label: string; shifts: Shift[] };

/** Danh mục đã chia sẵn theo ngữ cảnh chọn, tính một lần cho cả trang. */
export type CatalogView = {
  catalog: Catalog;
  shiftById: ReadonlyMap<number, Shift>;
  locationById: ReadonlyMap<number, WorkLocation>;
  /** Ô ngày thường: ca thường + nghỉ chiều. */
  weekdayShiftGroups: ShiftGroup[];
  /** "Áp cho cả tuần": chỉ ca thường. */
  fullDayShiftGroups: ShiftGroup[];
  weekendShiftGroups: ShiftGroup[];
  /** Ca tối đang dùng cho T2→T6. Thường chỉ có một (K15); có nhiều hơn thì tab Tối cho chọn. */
  eveningShifts: Shift[];
  weekdayLocations: WorkLocation[];
  weekendLocations: WorkLocation[];
  eveningLocations: WorkLocation[];
};

export function buildCatalogView(catalog: Catalog): CatalogView {
  const main = catalog.shifts.filter((shift) => shift.slot === "MAIN" && shift.active);
  const fullDay: ShiftGroup = { label: "Ca thường", shifts: main.filter((s) => s.onWeekday && !s.halfDay) };
  const halfDay: ShiftGroup = { label: "Nghỉ chiều", shifts: main.filter((s) => s.onWeekday && s.halfDay) };
  const weekend: ShiftGroup = { label: "Ca T7-CN", shifts: main.filter((s) => s.onWeekend) };
  const locations = catalog.locations.filter((location) => location.active);
  return {
    catalog,
    shiftById: new Map(catalog.shifts.map((shift) => [shift.id, shift])),
    locationById: new Map(catalog.locations.map((location) => [location.id, location])),
    weekdayShiftGroups: [fullDay, halfDay],
    fullDayShiftGroups: [fullDay],
    weekendShiftGroups: [weekend],
    eveningShifts: catalog.shifts.filter((shift) => shift.slot === "EVENING" && shift.active && shift.onWeekday),
    weekdayLocations: locations.filter((location) => location.onWeekday),
    weekendLocations: locations.filter((location) => location.onWeekend),
    eveningLocations: locations.filter((location) => location.onEvening),
  };
}

/** Cảnh báo không chặn cho một ô có ca: thiếu địa điểm, hoặc ca của cơ sở này xếp ở cơ sở khác. */
export function cellWarning(view: CatalogView, content: Pick<CellContent, "shiftId" | "locationId">): string | null {
  const shift = content.shiftId === null ? undefined : view.shiftById.get(content.shiftId);
  if (!shift) return null;
  if (content.locationId === null) return "Chưa chọn địa điểm";
  const location = view.locationById.get(content.locationId);
  if (location && shift.siteId !== null && location.siteId !== shift.siteId) {
    const site = view.catalog.sites.find((s) => s.id === shift.siteId);
    return `Ca ${shift.code} là ca của ${site?.name ?? "cơ sở khác"}`;
  }
  return null;
}

/** Tuần sau khi một ô được đặt nội dung mới (hoặc xoá, khi `content` là null) — chưa có xác nhận của máy chủ. */
export function withLocalCell(week: WeekView, ref: CellRef, content: CellContent | null): WeekView {
  const key = cellKey(ref);
  const existing = week.assignments.find((assignment) => cellKey(assignment) === key);
  const others = week.assignments.filter((assignment) => assignment !== existing);
  if (content === null) return { ...week, assignments: others };
  const updated: Assignment = { id: existing?.id ?? 0, version: existing?.version ?? 0, ...ref, ...content };
  return { ...week, assignments: [...others, updated] };
}

/** Tuần sau khi nhận trạng thái thật của một ô từ máy chủ (`null` = ô không còn). */
export function withServerCell(week: WeekView, ref: CellRef, saved: Assignment | null): WeekView {
  const key = cellKey(ref);
  const others = week.assignments.filter((assignment) => cellKey(assignment) !== key);
  return { ...week, assignments: saved ? [...others, saved] : others };
}
