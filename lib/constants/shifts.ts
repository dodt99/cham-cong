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
      { code: "K02", name: "Ca 5h00-16h30 Nhà K1", note: "Ca thường" },
      { code: "K04", name: "Ca 5h30-16h30 Nhà K1", note: "Ca thường" },
      { code: "K07", name: "Ca 6h00-16h30 Nhà K1", note: "Ca thường" },
      { code: "K10", name: "Ca 7h00-16h30 Nhà K1", note: "Ca thường" },
      { code: "K11", name: "Ca 7h30-16h30 Nhà K1", note: "Ca thường" },
      { code: "K12", name: "Ca 7h30-17h30 Nhà K1", note: "Ca thường" },
    ],
  },
  {
    label: "Ca tối",
    shifts: [
      { code: "K15", name: "Ca 16h30-20h00 Nhà K1", note: "Ca tối" },
    ],
  },
  {
    label: "Ca thứ 7 - CN",
    shifts: [
      { code: "K01", name: "Ca 5h00-14h30 Nhà K1", note: "Ca thứ 7 - CN" },
      { code: "K03", name: "Ca 5h30-15h00 Nhà K1", note: "Ca thứ 7 - CN" },
      { code: "K06", name: "Ca 6h00-15h30 Nhà K1", note: "Ca thứ 7 - CN" },
      { code: "K38", name: "Ca 6h30 - 16h00 Nhà K1", note: "Ca thứ 7 - CN" },
      { code: "K18", name: "Ca 7h30-17h00 Nhà K1", note: "Ca thứ 7 - CN" },
      { code: "K13", name: "Ca 8h00-17h30 Nhà K1", note: "Ca thứ 7 - CN" },
      { code: "K14", name: "Ca 8h30-18h00 Nhà K1", note: "Ca thứ 7 - CN" },
    ],
  },
  {
    label: "Nghỉ nửa ngày",
    shifts: [
      { code: "K35", name: "Ca 5h00 - 12h00 Nhà K1", note: "Nghỉ nửa ngày" },
      { code: "K36", name: "Ca 5h30 - 12h00 Nhà K1", note: "Nghỉ nửa ngày" },
      { code: "K37", name: "Ca 6h00 - 12h00 Nhà K1", note: "Nghỉ nửa ngày" },
      { code: "K39", name: "Ca 7h30 - 12h00 Nhà K1", note: "Nghỉ nửa ngày" },
      { code: "K40", name: "Ca 13h30 - 17h30 Nhà K1", note: "Nghỉ nửa ngày" },
    ],
  },
];

/** Flat list for lookup by code */
export const SHIFTS: Shift[] = SHIFT_GROUPS.flatMap((g) => g.shifts);

export const EMPTY_SHIFT_VALUE = "__empty__";

export function getShiftByCode(code: string): Shift | undefined {
  return SHIFTS.find((s) => s.code === code);
}
