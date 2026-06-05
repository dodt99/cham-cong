"use client";

import { memo, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  getWorkLocationByKey,
  getWorkLocationsForVariant,
  type WorkLocation,
  type WorkLocationSelectVariant,
} from "@/lib/constants/work-locations";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function locationCommandValue(loc: WorkLocation): string {
  return `${loc.code} ${loc.name} ${loc.block}`;
}

type WorkLocationSelectProps = {
  value: string | null;
  onChange: (key: string | null) => void;
  placeholder?: string;
  className?: string;
  toneClassName?: string;
  disabled?: boolean;
  variant?: WorkLocationSelectVariant;
  locations?: WorkLocation[];
};

function WorkLocationSelectInner({
  value,
  onChange,
  placeholder = "Địa điểm",
  className,
  toneClassName,
  disabled = false,
  variant = "default",
  locations,
}: WorkLocationSelectProps) {
  const [open, setOpen] = useState(false);
  const resolvedLocations = useMemo(
    () => locations ?? getWorkLocationsForVariant(variant),
    [locations, variant],
  );
  const selectedLocation = value ? getWorkLocationByKey(value) : undefined;
  const triggerClassName = cn(className ?? "w-full min-w-0 sm:w-[200px]");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-9 justify-between px-3 font-normal shadow-sm",
            triggerClassName,
            toneClassName,
            !selectedLocation && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selectedLocation ? (
              <>
                <span className="font-mono text-xs text-muted-foreground">
                  {selectedLocation.code}
                </span>
                <span className="ml-2">{selectedLocation.name}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[max(var(--radix-popover-trigger-width),14rem)] max-w-[min(20rem,calc(100vw-2rem))] p-0"
        align="start"
      >
        {open ? (
          <Command>
            <CommandInput placeholder="Tìm mã, tên, tầng..." />
            <CommandList className="max-h-[min(24rem,70vh)]">
              <CommandEmpty>Không tìm thấy địa điểm</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="- trống"
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === null ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="text-muted-foreground">-</span>
                </CommandItem>
                {resolvedLocations.map((loc) => (
                  <CommandItem
                    key={loc.key}
                    value={locationCommandValue(loc)}
                    title={`${loc.name} · ${loc.code}`}
                    onSelect={() => {
                      onChange(loc.key);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === loc.key ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="font-mono text-xs text-muted-foreground">
                      {loc.code}
                    </span>
                    <span className="ml-2">{loc.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export const WorkLocationSelect = memo(WorkLocationSelectInner);
