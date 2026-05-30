import { redirect } from "next/navigation";

import { DEFAULT_ATTENDANCE_ROUTE } from "@/lib/constants/attendance-routes";

export default function Home() {
  redirect(DEFAULT_ATTENDANCE_ROUTE);
}
