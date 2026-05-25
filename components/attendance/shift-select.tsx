"use client";

import { EMPTY_SHIFT_VALUE, SHIFTS } from "@/lib/constants/shifts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ShiftSelectProps = {
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
  className?: string;
};

export function ShiftSelect({
  value,
  onChange,
  placeholder = "Chọn ca",
  className,
}: ShiftSelectProps) {
  const selectValue = value ?? EMPTY_SHIFT_VALUE;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) =>
        onChange(v === EMPTY_SHIFT_VALUE ? null : v)
      }
    >
      <SelectTrigger className={className ?? "w-[140px]"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={EMPTY_SHIFT_VALUE}>
          <span className="text-muted-foreground">— Không chọn —</span>
        </SelectItem>
        {SHIFTS.map((shift) => (
          <SelectItem key={shift.code} value={shift.code} title={shift.note}>
            <span>{shift.name}</span>
            <span className="ml-1 text-xs text-muted-foreground">
              ({shift.code})
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
