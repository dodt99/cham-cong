export type OffType = "leave" | "sick" | "business_trip" | "maternity_leave";

export const OFF_TYPE_LABELS: Record<OffType, string> = {
  leave: "Nghỉ",
  sick: "Nghỉ ốm",
  business_trip: "Công tác",
  maternity_leave: "Nghỉ đẻ",
};

export const OFF_TYPE_OPTIONS: { value: OffType; label: string }[] = [
  { value: "leave", label: OFF_TYPE_LABELS.leave },
  { value: "sick", label: OFF_TYPE_LABELS.sick },
  { value: "business_trip", label: OFF_TYPE_LABELS.business_trip },
  { value: "maternity_leave", label: OFF_TYPE_LABELS.maternity_leave },
];

export const DEFAULT_OFF_TYPE: OffType = "leave";

export function getOffExportNote(
  offType: OffType | null | undefined,
): string | null {
  if (offType === "sick") return OFF_TYPE_LABELS.sick;
  if (offType === "business_trip") return OFF_TYPE_LABELS.business_trip;
  if (offType === "maternity_leave") return OFF_TYPE_LABELS.maternity_leave;
  return null;
}

export function resolveOffType(
  offType: OffType | null | undefined,
): OffType {
  return offType ?? DEFAULT_OFF_TYPE;
}
