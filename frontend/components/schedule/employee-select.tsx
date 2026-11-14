"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Member } from "@/lib/api/types";
import { matchesSearch, searchValue } from "@/lib/search";
import { cn } from "@/lib/utils";

type EmployeeSelectProps = {
  members: Member[];
  value: number | null;
  onChange: (employeeId: number | null) => void;
  className?: string;
  disabled?: boolean;
};

export function EmployeeSelect({ members, value, onChange, className, disabled = false }: EmployeeSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = members.find((member) => member.employeeId === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("h-9 justify-between px-3 font-normal shadow-sm", className ?? "w-full",
            !selected && "text-muted-foreground")}
        >
          <span className="truncate">
            {selected ? (
              <>
                <span className="font-mono text-xs text-muted-foreground">{selected.code}</span>
                <span className="ml-2">{selected.fullName}</span>
              </>
            ) : (
              "Chọn nhân viên"
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[max(var(--radix-popover-trigger-width),16rem)] p-0" align="start">
        {open ? (
          <Command filter={matchesSearch}>
            <CommandInput placeholder="Tìm mã, tên nhân viên..." />
            <CommandList className="max-h-[min(24rem,70vh)]">
              <CommandEmpty>Không tìm thấy nhân viên</CommandEmpty>
              <CommandGroup>
                {members.map((member) => (
                  <CommandItem
                    key={member.employeeId}
                    value={searchValue(member.code, member.fullName)}
                    onSelect={() => {
                      onChange(member.employeeId);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("h-4 w-4", value === member.employeeId ? "opacity-100" : "opacity-0")} />
                    <span className="font-mono text-xs text-muted-foreground">{member.code}</span>
                    <span className="ml-2">{member.fullName}</span>
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
