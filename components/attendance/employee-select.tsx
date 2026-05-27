"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { Employee } from "@/lib/constants/employees";
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

function employeeCommandValue(employee: Employee): string {
  return `${employee.id} ${employee.fullName}`;
}

type EmployeeSelectProps = {
  value: string | null;
  onChange: (employeeId: string | null) => void;
  employees: Employee[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
};

export function EmployeeSelect({
  value,
  onChange,
  employees,
  placeholder = "Chọn nhân viên",
  className,
  disabled = false,
  id,
}: EmployeeSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedEmployee = value
    ? employees.find((e) => e.id === value)
    : undefined;
  const triggerClassName = cn(className ?? "w-full");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-9 justify-between px-3 font-normal shadow-sm",
            triggerClassName,
            !selectedEmployee && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selectedEmployee ? (
              <>
                <span className="font-mono text-xs text-muted-foreground">
                  {selectedEmployee.id}
                </span>
                <span className="ml-2">{selectedEmployee.fullName}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("p-0", triggerClassName)}
        align="start"
      >
        <Command>
          <CommandInput placeholder="Tìm mã, tên nhân viên..." />
          <CommandList className="max-h-[min(24rem,70vh)]">
            <CommandEmpty>Không tìm thấy nhân viên</CommandEmpty>
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
              {employees.map((employee) => (
                <CommandItem
                  key={employee.id}
                  value={employeeCommandValue(employee)}
                  onSelect={() => {
                    onChange(employee.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === employee.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="font-mono text-xs text-muted-foreground">
                    {employee.id}
                  </span>
                  <span className="ml-2">{employee.fullName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
