"use client";

import { memo, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  getShiftByCode,
  getShiftGroupsForVariant,
  type Shift,
  type ShiftSelectVariant,
} from "@/lib/constants/shifts";
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

function shiftCommandValue(shift: Shift): string {
  return `${shift.code} ${shift.name} ${shift.note}`;
}

type ShiftSelectProps = {
  value: string | null;
  onChange: (code: string | null) => void;
  variant: ShiftSelectVariant;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

function ShiftSelectInner({
  value,
  onChange,
  variant,
  placeholder = "Chọn ca",
  className,
  disabled = false,
}: ShiftSelectProps) {
  const [open, setOpen] = useState(false);
  const shiftGroups = useMemo(
    () => getShiftGroupsForVariant(variant),
    [variant],
  );
  const selectedShift = value ? getShiftByCode(value) : undefined;
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
            !selectedShift && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selectedShift ? (
              <>
                <span className="font-mono text-xs text-muted-foreground">
                  {selectedShift.code}
                </span>
                <span className="ml-2">{selectedShift.name}</span>
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
            <CommandInput placeholder="Tìm mã ca, khung giờ..." />
            <CommandList className="max-h-[min(24rem,70vh)]">
              <CommandEmpty>Không tìm thấy ca</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="- nghỉ"
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
                  <span className="text-muted-foreground">- Nghỉ -</span>
                </CommandItem>
              </CommandGroup>
              {shiftGroups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.shifts.map((shift) => (
                    <CommandItem
                      key={shift.code}
                      value={shiftCommandValue(shift)}
                      title={`${shift.note} · ${shift.code}`}
                      onSelect={() => {
                        onChange(shift.code);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === shift.code ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {shift.code}
                      </span>
                      <span className="ml-2">{shift.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export const ShiftSelect = memo(ShiftSelectInner);
