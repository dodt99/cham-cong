export const ATTENDANCE_ROUTES = [
  { href: "/weekday", label: "Ngày thường" },
  { href: "/evening", label: "Tối" },
  { href: "/weekend", label: "T7-CN" },
  { href: "/export-fast", label: "Export Fast" },
  { href: "/export-early", label: "Export Sớm" },
  { href: "/export-evening", label: "Export Tối" },
  { href: "/export-weekend", label: "Export T7-CN" },
] as const;

export const DEFAULT_ATTENDANCE_ROUTE = ATTENDANCE_ROUTES[0].href;
