import type { DayKey } from "@/lib/types/attendance";

export const DEFAULT_SELECT_TONE_CLASS =
  "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/50 dark:border-yellow-800 dark:hover:bg-yellow-950/70";

export const DAY_SELECT_TONE_CLASS: Record<DayKey, string> = {
  mon: "bg-pink-100 border-pink-300 hover:bg-pink-200 dark:bg-pink-950/60 dark:border-pink-700 dark:hover:bg-pink-950/80",
  tue: "bg-[#d4f2f1] border-[#5BC2C1] hover:bg-[#b8e8e7] dark:bg-[#5BC2C1]/25 dark:border-[#5BC2C1] dark:hover:bg-[#5BC2C1]/40",
  wed: "bg-sky-100 border-sky-300 hover:bg-sky-200 dark:bg-sky-950/60 dark:border-sky-700 dark:hover:bg-sky-950/80",
  thu: "bg-[#F7D6D0] border-[#e8b8ae] hover:bg-[#f0c4bc] dark:bg-[#F7D6D0]/25 dark:border-[#e8b8ae] dark:hover:bg-[#F7D6D0]/40",
  fri: "bg-violet-100 border-violet-300 hover:bg-violet-200 dark:bg-violet-950/60 dark:border-violet-700 dark:hover:bg-violet-950/80",
  sat: "bg-[#d4e8de] border-[#8CB3A2] hover:bg-[#c0dbd0] dark:bg-[#8CB3A2]/25 dark:border-[#8CB3A2] dark:hover:bg-[#8CB3A2]/40",
  sun: "bg-[#fce4de] border-[#E79989] hover:bg-[#f5c8be] dark:bg-[#E79989]/25 dark:border-[#E79989] dark:hover:bg-[#E79989]/40",
};

export function getDaySelectToneClass(day: DayKey): string {
  return DAY_SELECT_TONE_CLASS[day];
}
