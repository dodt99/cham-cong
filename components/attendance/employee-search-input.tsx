"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

type EmployeeSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function EmployeeSearchInput({
  value,
  onChange,
  className,
}: EmployeeSearchInputProps) {
  return (
    <div className={cn("relative mb-4 max-w-md", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Tìm mã, tên nhân viên..."
        aria-label="Tìm nhân viên"
        className="flex h-9 w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </div>
  );
}
