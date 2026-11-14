"use client";

import { memo, useState } from "react";
import { Check, ChevronsUpDown, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Block, WorkLocation } from "@/lib/api/types";
import { matchesSearch, searchValue } from "@/lib/search";
import { cn } from "@/lib/utils";

type LocationSelectProps = {
  locations: WorkLocation[];
  blocks: Block[];
  location: WorkLocation | undefined;
  onChange: (locationId: number | null) => void;
  /** Cảnh báo không chặn (thiếu địa điểm, sai cơ sở). */
  warning?: string | null;
  className?: string;
  toneClassName?: string;
  disabled?: boolean;
};

function LocationSelectInner({
  locations,
  blocks,
  location,
  onChange,
  warning,
  className,
  toneClassName,
  disabled = false,
}: LocationSelectProps) {
  const [open, setOpen] = useState(false);
  const blockName = (blockId: number) => blocks.find((block) => block.id === blockId)?.name ?? "";
  const choose = (locationId: number | null) => () => {
    onChange(locationId);
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
          title={warning ?? undefined}
          className={cn(
            "h-9 justify-between px-3 font-normal shadow-sm",
            className ?? "w-full min-w-0 sm:w-[200px]",
            toneClassName,
            !location && "text-muted-foreground",
            warning && "ring-2 ring-amber-500/70",
          )}
        >
          <span className="truncate">
            {location ? (
              <>
                <span className="font-mono text-xs text-muted-foreground">{location.code}</span>
                <span className="ml-2">{location.name}</span>
              </>
            ) : (
              "Địa điểm"
            )}
          </span>
          {warning ? (
            <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" aria-label={warning} />
          ) : (
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[max(var(--radix-popover-trigger-width),14rem)] max-w-[min(20rem,calc(100vw-2rem))] p-0"
        align="start"
      >
        {open ? (
          <Command filter={matchesSearch}>
            <CommandInput placeholder="Tìm mã, tên, tầng..." />
            <CommandList className="max-h-[min(24rem,70vh)]">
              <CommandEmpty>Không tìm thấy địa điểm</CommandEmpty>
              <CommandGroup>
                <CommandItem value={searchValue("- trống")} onSelect={choose(null)}>
                  <Check className={cn("h-4 w-4", location ? "opacity-0" : "opacity-100")} />
                  <span className="text-muted-foreground">-</span>
                </CommandItem>
                {locations.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={searchValue(option.code, option.name, blockName(option.blockId))}
                    title={`${option.name} · ${blockName(option.blockId)}`}
                    onSelect={choose(option.id)}
                  >
                    <Check className={cn("h-4 w-4", location?.id === option.id ? "opacity-100" : "opacity-0")} />
                    <span className="font-mono text-xs text-muted-foreground">{option.code}</span>
                    <span className="ml-2">{option.name}</span>
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

export const LocationSelect = memo(LocationSelectInner);
