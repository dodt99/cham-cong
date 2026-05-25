"use client";

import {
  EMPTY_SHIFT_VALUE,
  SHIFT_GROUPS,
} from "@/lib/constants/shifts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
      <SelectTrigger className={className ?? "w-[200px]"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[min(24rem,70vh)]">
        <SelectItem value={EMPTY_SHIFT_VALUE}>
          <span className="text-muted-foreground">— Nghỉ —</span>
        </SelectItem>
        {SHIFT_GROUPS.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.shifts.map((shift) => (
              <SelectItem
                key={shift.code}
                value={shift.code}
                title={`${shift.note} · ${shift.code}`}
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {shift.code}
                </span>
                <span className="ml-2">{shift.name}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
