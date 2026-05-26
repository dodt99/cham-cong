export type Shift = {
  code: string;
  name: string;
  note: string;
};

export type ShiftGroup = {
  label: string;
  shifts: Shift[];
};

export const SHIFT_GROUPS: ShiftGroup[] = [
  {
    label: "Ca thường",
    shifts: [
      { code: "K02", name: "5h00-16h30", note: "Ca thường" },
      { code: "K04", name: "5h30-16h30", note: "Ca thường" },
      { code: "K07", name: "6h00-16h30", note: "Ca thường" },
      { code: "K10", name: "7h00-16h30", note: "Ca thường" },
      { code: "K11", name: "7h30-16h30", note: "Ca thường" },
      { code: "K12", name: "7h30-17h30", note: "Ca thường" },
    ],
  },
  {
    label: "Ca tối",
    shifts: [
      { code: "K15", name: "16h30-20h00", note: "Ca tối" },
    ],
  },
  {
    label: "Ca thứ 7 - CN",
    shifts: [
      { code: "K01", name: "5h00-14h30", note: "Ca thứ 7 - CN" },
      { code: "K03", name: "5h30-15h00", note: "Ca thứ 7 - CN" },
      { code: "K06", name: "6h00-15h30", note: "Ca thứ 7 - CN" },
      { code: "K38", name: "6h30 - 16h00", note: "Ca thứ 7 - CN" },
      { code: "K18", name: "7h30-17h00", note: "Ca thứ 7 - CN" },
      { code: "K13", name: "8h00-17h30", note: "Ca thứ 7 - CN" },
      { code: "K14", name: "8h30-18h00", note: "Ca thứ 7 - CN" },
    ],
  },
  {
    label: "Nghỉ chiều",
    shifts: [
      { code: "K35", name: "5h00 - 12h00", note: "Nghỉ chiều" },
      { code: "K36", name: "5h30 - 12h00", note: "Nghỉ chiều" },
      { code: "K37", name: "6h00 - 12h00", note: "Nghỉ chiều" },
      { code: "K39", name: "7h30 - 12h00", note: "Nghỉ chiều" },
      // { code: "K40", name: "13h30 - 17h30", note: "Nghỉ chiều" },
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
  weekend: ["Ca thứ 7 - CN"],
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
