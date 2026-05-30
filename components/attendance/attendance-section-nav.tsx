"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ATTENDANCE_ROUTES } from "@/lib/constants/attendance-routes";
import { selectHasActiveSheet } from "@/lib/attendance/selectors";
import { cn } from "@/lib/utils";
import { useAttendanceZustandStore } from "@/stores/attendance-store";

export function AttendanceSectionNav() {
  const pathname = usePathname();
  const hasActiveSheet = useAttendanceZustandStore(selectHasActiveSheet);

  if (!hasActiveSheet) {
    return (
      <div className="flex min-h-80 min-w-0 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4 text-center sm:p-8">
        <p className="text-lg font-medium">Chưa có bảng chấm công</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Bấm &quot;Tạo bảng mới&quot; để chọn tuần và bắt đầu chấm công.
        </p>
      </div>
    );
  }

  return (
    <nav
      aria-label="Khu vực chấm công"
      className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-muted p-1 text-muted-foreground"
    >
      {ATTENDANCE_ROUTES.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive && "bg-background text-foreground shadow",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
