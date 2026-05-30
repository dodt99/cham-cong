import { AttendanceShell } from "@/components/attendance/attendance-shell";

export default function AttendanceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AttendanceShell>{children}</AttendanceShell>;
}
