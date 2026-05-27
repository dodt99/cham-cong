"use client";

import {
  EMPTY_LOCATION_VALUE,
  getWorkLocationsForVariant,
  type WorkLocation,
  type WorkLocationSelectVariant,
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
  variant?: WorkLocationSelectVariant;
  locations?: WorkLocation[];
};

export function WorkLocationSelect({
  value,
  onChange,
  placeholder = "Địa điểm",
  className,
  disabled = false,
  variant = "default",
  locations,
}: WorkLocationSelectProps) {
  const resolvedLocations =
    locations ?? getWorkLocationsForVariant(variant);
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
          <span className="text-muted-foreground">-</span>
        </SelectItem>
        {resolvedLocations.map((loc) => (
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
