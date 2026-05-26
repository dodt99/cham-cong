"use client";

import {
  EMPTY_LOCATION_VALUE,
  WORK_LOCATIONS,
  type WorkLocation,
} from "@/lib/constants/work-locations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WorkLocationSelectProps = {
  value: string | null;
  onChange: (key: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  locations?: WorkLocation[];
};

export function WorkLocationSelect({
  value,
  onChange,
  placeholder = "Địa điểm",
  className,
  disabled = false,
  locations = WORK_LOCATIONS,
}: WorkLocationSelectProps) {
  const selectValue = value ?? EMPTY_LOCATION_VALUE;

  return (
    <Select
      value={selectValue}
      onValueChange={(v) =>
        onChange(v === EMPTY_LOCATION_VALUE ? null : v)
      }
      disabled={disabled}
    >
      <SelectTrigger className={className ?? "w-[200px]"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[min(24rem,70vh)]">
        <SelectItem value={EMPTY_LOCATION_VALUE}>
          <span className="text-muted-foreground">— Chưa chọn —</span>
        </SelectItem>
        {locations.map((loc) => (
          <SelectItem
            key={loc.key}
            value={loc.key}
            title={`${loc.name} · ${loc.code}`}
          >
            <span className="font-mono text-xs text-muted-foreground">
              {loc.code}
            </span>
            <span className="ml-2">{loc.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
