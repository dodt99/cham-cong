"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DeferredTabPanelProps = {
  tabValue: string;
  selectedTab: string;
  renderedTab: string;
  isPending: boolean;
  fallback: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DeferredTabPanel({
  tabValue,
  selectedTab,
  renderedTab,
  isPending,
  fallback,
  children,
  className,
}: DeferredTabPanelProps) {
  if (selectedTab !== tabValue) return null;

  const showFallback = isPending || renderedTab !== tabValue;

  return (
    <div
      className={cn(className)}
      aria-busy={showFallback}
      aria-live="polite"
    >
      {showFallback ? fallback : children}
    </div>
  );
}

export function AttendanceTableSkeleton() {
  return (
    <div className="flex min-h-[480px] animate-pulse flex-col gap-3 rounded-md border bg-muted/20 p-4">
      <div className="h-8 w-full max-w-md rounded bg-muted" />
      <div className="flex-1 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-muted/80" />
        ))}
      </div>
    </div>
  );
}
