"use client";

import { memo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { OffType, Shift } from "@/lib/api/types";
import { type ShiftGroup, shiftHours } from "@/lib/schedule/model";
import { matchesSearch, searchValue } from "@/lib/search";
import { cn } from "@/lib/utils";

type ShiftSelectProps = {
  groups: ShiftGroup[];
  /** Các loại nghỉ chọn được; bỏ trống (T7-CN) thì chỉ có một lựa chọn "Nghỉ" đưa ô về trống. */
  offTypes?: OffType[];
  shift: Shift | undefined;
  offType: OffType | undefined;
  /** Chữ hiện khi ô chưa có gì. */
  emptyLabel: string;
  onSelectShift: (shiftId: number) => void;
  onSelectOff?: (offTypeId: number) => void;
  onClear: () => void;
  className?: string;
  toneClassName?: string;
  disabled?: boolean;
};

function ShiftSelectInner({
  groups,
  offTypes,
  shift,
  offType,
  emptyLabel,
  onSelectShift,
  onSelectOff,
  onClear,
  className,
  toneClassName,
  disabled = false,
}: ShiftSelectProps) {
  const [open, setOpen] = useState(false);
  const isEmpty = !shift && !offType;
  const choose = (action: () => void) => () => {
    action();
    setOpen(false);
  };

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
            className ?? "w-full min-w-0 sm:w-[200px]",
            toneClassName,
            !shift && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {shift ? (
              <>
                <span className="font-mono text-xs text-muted-foreground">{shift.code}</span>
                <span className="ml-2">{shiftHours(shift)}</span>
              </>
            ) : offType ? (
              <span className="text-foreground">{offType.label}</span>
            ) : (
              emptyLabel
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
          <Command filter={matchesSearch}>
            <CommandInput placeholder="Tìm mã ca, khung giờ..." />
            <CommandList className="max-h-[min(24rem,70vh)]">
              <CommandEmpty>Không tìm thấy ca</CommandEmpty>
              <CommandGroup>
                <CommandItem value={searchValue("-", emptyLabel)} onSelect={choose(onClear)}>
                  <Check className={cn("h-4 w-4", isEmpty ? "opacity-100" : "opacity-0")} />
                  <span className="text-muted-foreground">- {emptyLabel} -</span>
                </CommandItem>
                {offTypes?.map((option) => (
                  <CommandItem key={option.id} value={searchValue(option.label)} onSelect={choose(() => onSelectOff?.(option.id))}>
                    <Check className={cn("h-4 w-4", offType?.id === option.id ? "opacity-100" : "opacity-0")} />
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              {groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.shifts.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={searchValue(option.code, shiftHours(option), group.label)}
                      onSelect={choose(() => onSelectShift(option.id))}
                    >
                      <Check className={cn("h-4 w-4", shift?.id === option.id ? "opacity-100" : "opacity-0")} />
                      <span className="font-mono text-xs text-muted-foreground">{option.code}</span>
                      <span className="ml-2">{shiftHours(option)}</span>
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
