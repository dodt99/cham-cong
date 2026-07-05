export type ShiftTime = { h: number; m: number };

export type Shift = {
  code: string;
  name: string;
  note: string;
  assignedStart: ShiftTime;
  assignedEnd: ShiftTime;
};

export type ShiftGroup = {
  label: string;
  shifts: Shift[];
};

function shift(
  code: string,
  name: string,
  note: string,
  assignedStart: ShiftTime,
  assignedEnd: ShiftTime,
): Shift {
  return { code, name, note, assignedStart, assignedEnd };
}

export const SHIFT_GROUPS: ShiftGroup[] = [
  {
    label: "Ca thường",
    shifts: [
      shift("K02", "5h00-16h30", "Ca thường", { h: 5, m: 0 }, { h: 16, m: 30 }),
      shift("K04", "5h30-16h30", "Ca thường", { h: 5, m: 30 }, { h: 16, m: 30 }),
      shift("K07", "6h00-16h30", "Ca thường", { h: 6, m: 0 }, { h: 16, m: 30 }),
      shift("K18", "7h30-17h00", "Ca thường", { h: 7, m: 30 }, { h: 17, m: 0 }),
      shift("K43", "6h30-16h30", "Ca thường", { h: 6, m: 30 }, { h: 16, m: 30 }),
    ],
  },
  {
    label: "Ca tối",
    shifts: [
      shift("K15", "16h30-20h00", "Ca tối", { h: 16, m: 30 }, { h: 20, m: 0 }),
    ],
  },
  {
    label: "Ca T7-CN",
    shifts: [
      shift("K01", "5h00-15h30", "Ca T7-CN", { h: 5, m: 0 }, { h: 15, m: 30 }),
      shift("K03", "5h30-16h00", "Ca T7-CN", { h: 5, m: 30 }, { h: 16, m: 0 }),
      shift("K06", "6h00-16h30", "Ca T7-CN", { h: 6, m: 0 }, { h: 16, m: 30 }),
      shift("K10", "7h00-17h30", "Ca T7-CN", { h: 7, m: 0 }, { h: 17, m: 30 }),
      shift("K09", "6h30-16h30", "Ca T7-CN", { h: 6, m: 30 }, { h: 16, m: 30 }),
    ],
  },
  {
    label: "Nghỉ chiều",
    shifts: [
      shift("K35", "5h00-12h00", "Nghỉ chiều", { h: 5, m: 0 }, { h: 12, m: 0 }),
      shift("K36", "5h30-12h00", "Nghỉ chiều", { h: 5, m: 30 }, { h: 12, m: 0 }),
      shift("K37", "6h00-12h00", "Nghỉ chiều", { h: 6, m: 0 }, { h: 12, m: 0 }),
      shift("K39", "7h30-12h00", "Nghỉ chiều", { h: 7, m: 30 }, { h: 12, m: 0 }
      ),
    ],
  },
];

/** Flat list for lookup by code */
export const SHIFTS: Shift[] = SHIFT_GROUPS.flatMap((g) => g.shifts);

export const AFTERNOON_OFF_LABEL = "Nghỉ chiều";

const AFTERNOON_OFF_SHIFT_CODES = new Set(
  SHIFT_GROUPS.find((g) => g.label === AFTERNOON_OFF_LABEL)?.shifts.map(
    (s) => s.code,
  ) ?? [],
);

export function isAfternoonOffShift(code: string): boolean {
  return AFTERNOON_OFF_SHIFT_CODES.has(code);
}

export type ShiftSelectVariant = "default" | "weekday" | "weekend";

const VARIANT_GROUP_LABELS: Record<ShiftSelectVariant, string[]> = {
  default: ["Ca thường"],
  weekday: ["Ca thường", AFTERNOON_OFF_LABEL],
  weekend: ["Ca T7-CN"],
};

export function getShiftGroupsForVariant(
  variant: ShiftSelectVariant,
): ShiftGroup[] {
  const labels = VARIANT_GROUP_LABELS[variant];
  return SHIFT_GROUPS.filter((g) => labels.includes(g.label));
}

export const EMPTY_SHIFT_VALUE = "__empty__";

export function getShiftByCode(code: string): Shift | undefined {
  return SHIFTS.find((s) => s.code === code);
}

export function getShiftAssignedTimes(
  code: string,
): { start: ShiftTime; end: ShiftTime } | null {
  const s = getShiftByCode(code);
  if (!s) return null;
  return { start: s.assignedStart, end: s.assignedEnd };
}
