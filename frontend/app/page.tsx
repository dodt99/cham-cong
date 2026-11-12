"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { currentWeekStart } from "@/lib/week";

/** Trang gốc mở tuần hiện tại (tính theo giờ máy người dùng). */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/weeks/${currentWeekStart()}`);
  }, [router]);
  return null;
}
