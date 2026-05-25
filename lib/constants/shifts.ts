export type Shift = {
  code: string;
  name: string;
  note: string;
};

export const SHIFTS: Shift[] = [
  {
    code: "S",
    name: "Ca sáng",
    note: "07:00 – 12:00",
  },
  {
    code: "C",
    name: "Ca chiều",
    note: "13:00 – 18:00",
  },
  {
    code: "CN",
    name: "Cả ngày",
    note: "07:00 – 18:00",
  },
  {
    code: "T",
    name: "Ca tối",
    note: "18:00 – 22:00",
  },
  {
    code: "SC",
    name: "Sáng + Chiều",
    note: "07:00 – 18:00 (nghỉ trưa ngắn)",
  },
  {
    code: "OFF",
    name: "Nghỉ",
    note: "Không làm việc",
  },
];

export const EMPTY_SHIFT_VALUE = "__empty__";
