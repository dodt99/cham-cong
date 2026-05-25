"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatWeekRange, sortWeekStarts } from "@/lib/utils/week";

type WeekTabsProps = {
  weekStarts: string[];
  activeWeekStart: string | null;
  onChange: (weekStart: string) => void;
};

export function WeekTabs({
  weekStarts,
  activeWeekStart,
  onChange,
}: WeekTabsProps) {
  if (weekStarts.length === 0) return null;

  const sorted = sortWeekStarts(weekStarts);

  return (
    <Tabs
      value={activeWeekStart ?? sorted[0]}
      onValueChange={onChange}
      className="w-full"
    >
      <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/60 p-1">
        {sorted.map((weekStart) => (
          <TabsTrigger
            key={weekStart}
            value={weekStart}
            className={cn(
              "px-3 py-2 text-xs sm:text-sm",
              "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold data-[state=active]:shadow-md",
            )}
          >
            {formatWeekRange(weekStart)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
