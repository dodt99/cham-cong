// Kiểu dữ liệu của API backend (xem backend/src/main/java/com/chamcong/**/…Dto).

export type Role = "ADMIN" | "EDITOR" | "VIEWER";

export type CurrentUser = {
  id: number;
  username: string;
  fullName: string;
  role: Role;
};

/** Khe trong ngày: MAIN = ca chính (hoặc nghỉ), EVENING = ca tối tăng cường. */
export type Slot = "MAIN" | "EVENING";

export type Site = { id: number; code: string; name: string };

export type Block = { id: number; name: string };

export type WorkLocation = {
  id: number;
  code: string;
  name: string;
  siteId: number;
  blockId: number;
  onWeekday: boolean;
  onEvening: boolean;
  onWeekend: boolean;
  active: boolean;
};

export type Shift = {
  id: number;
  code: string;
  /** "06:00:00" */
  startTime: string;
  endTime: string;
  slot: Slot;
  /** Ca nghỉ chiều. */
  halfDay: boolean;
  onWeekday: boolean;
  onWeekend: boolean;
  /** Ca chỉ dùng ở một cơ sở (2Kxx → CS2); null = không giới hạn. */
  siteId: number | null;
  active: boolean;
};

export type OffType = { id: number; code: string; label: string; isDefault: boolean };

export type Catalog = {
  sites: Site[];
  blocks: Block[];
  locations: WorkLocation[];
  shifts: Shift[];
  offTypes: OffType[];
};

export type Member = {
  employeeId: number;
  code: string;
  fullName: string;
  /** CORE = đội chính; SUPPORT = tăng cường, chỉ ca tối và T7-CN. */
  membership: "CORE" | "SUPPORT";
};

export type Assignment = {
  id: number;
  employeeId: number;
  /** yyyy-MM-dd */
  date: string;
  slot: Slot;
  shiftId: number | null;
  offTypeId: number | null;
  locationId: number | null;
  version: number;
};

export type WeekView = {
  weekStart: string;
  days: string[];
  members: Member[];
  assignments: Assignment[];
};

export type CellRef = { employeeId: number; date: string; slot: Slot };

/** Nội dung một ô: có ca (kèm địa điểm tuỳ chọn) hoặc có loại nghỉ. */
export type CellContent = {
  shiftId: number | null;
  offTypeId: number | null;
  locationId: number | null;
};

export type BulkMode = "OVERWRITE" | "FILL_EMPTY";

export type ExportType = "fast" | "early" | "evening" | "weekend";

export type ExportPreview = {
  fileName: string;
  sheets: {
    name: string;
    title: string | null;
    columns: string[];
    rows: string[][];
  }[];
};

// ---- quản trị (chỉ ADMIN) ----------------------------------------------------------------------

export type UserAccount = { id: number; username: string; fullName: string; role: Role; active: boolean };

export type Option = { id: number; label: string };

export type AdminReference = { positions: Option[]; sites: Option[]; blocks: Option[] };

export type AdminEmployee = {
  employeeId: number;
  code: string;
  fullName: string;
  taxCode: string;
  positionId: number;
  membership: Member["membership"];
  sortOrder: number;
  activeFrom: string | null;
  activeTo: string | null;
};

export type AdminShift = Shift & {
  /** Có lên file Làm sớm không. */
  earlyEligible: boolean;
  /** Giờ kết thúc ghi trên file Làm sớm nếu khác giờ kết thúc ca. */
  earlyEndTime: string | null;
  sortOrder: number;
};

export type AdminLocation = WorkLocation & { sortOrder: number };
