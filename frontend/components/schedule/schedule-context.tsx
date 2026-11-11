"use client";

import { createContext, useContext } from "react";

import type { CellContent, CellRef } from "@/lib/api/types";
import type { CatalogView } from "@/lib/schedule/model";

/** Những thứ không đổi khi dữ liệu tuần thay đổi — các ô đọc từ đây để không phải vẽ lại thừa. */
export type ScheduleEnvironment = {
  view: CatalogView;
  /** Ghi một ô; `content` null = xoá ô. */
  write: (ref: CellRef, content: CellContent | null) => void;
  /** VIEWER chỉ xem. */
  canEdit: boolean;
};

const ScheduleEnvironmentContext = createContext<ScheduleEnvironment | null>(null);

export const ScheduleEnvironmentProvider = ScheduleEnvironmentContext.Provider;

export function useScheduleEnvironment(): ScheduleEnvironment {
  const environment = useContext(ScheduleEnvironmentContext);
  if (!environment) throw new Error("ScheduleEnvironmentProvider is missing");
  return environment;
}
