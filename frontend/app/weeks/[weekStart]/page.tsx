"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

import { WeekPage } from "@/components/schedule/week-page";
import { currentWeekStart, isISODate, weekStartOf } from "@/lib/week";

export default function Page({ params }: { params: Promise<{ weekStart: string }> }) {
  const { weekStart } = use(params);
  const router = useRouter();

  // URL luôn mang ngày thứ Hai: ngày giữa tuần được đưa về thứ Hai, giá trị sai về tuần hiện tại.
  const monday = isISODate(weekStart) ? weekStartOf(weekStart) : currentWeekStart();
  useEffect(() => {
    if (monday !== weekStart) router.replace(`/weeks/${monday}`);
  }, [monday, weekStart, router]);

  return monday === weekStart ? <WeekPage weekStart={weekStart} /> : null;
}
