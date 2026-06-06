import type { DayKey } from "@/lib/types/attendance";

export const DEFAULT_SELECT_TONE_CLASS =
  "bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/50 dark:border-yellow-800 dark:hover:bg-yellow-950/70";

/** Left accent stripe — dominant day color (matches header + button palette). */
export const DAY_CARD_TONE_CLASS: Record<DayKey, string> = {
  mon: "!border-l-pink-600 dark:!border-l-pink-400",
  tue: "!border-l-[#5BC2C1] dark:!border-l-[#5BC2C1]",
  wed: "!border-l-sky-600 dark:!border-l-sky-400",
  thu: "!border-l-[#a85f4f] dark:!border-l-[#e8b8ae]",
  fri: "!border-l-violet-600 dark:!border-l-violet-400",
  sat: "!border-l-[#4a7360] dark:!border-l-[#8CB3A2]",
  sun: "!border-l-[#b85545] dark:!border-l-[#E79989]",
};

/** Subtle tinted background for list items inside day cards. */
export const DAY_ITEM_TONE_CLASS: Record<DayKey, string> = {
  mon: "bg-pink-50/80 dark:bg-pink-950/20",
  tue: "bg-[#d4f2f1]/40 dark:bg-[#5BC2C1]/10",
  wed: "bg-sky-50/80 dark:bg-sky-950/20",
  thu: "bg-[#F7D6D0]/40 dark:bg-[#F7D6D0]/10",
  fri: "bg-violet-50/80 dark:bg-violet-950/20",
  sat: "bg-[#c0dbd0]/40 dark:bg-[#8CB3A2]/10",
  sun: "bg-[#f5c8be]/40 dark:bg-[#E79989]/10",
};

export const DAY_SELECT_TONE_CLASS: Record<DayKey, string> = {
  mon: "bg-pink-100 border-pink-300 hover:bg-pink-200 dark:bg-pink-950/60 dark:border-pink-700 dark:hover:bg-pink-950/80",
  tue: "bg-[#d4f2f1] border-[#5BC2C1] hover:bg-[#b8e8e7] dark:bg-[#5BC2C1]/25 dark:border-[#5BC2C1] dark:hover:bg-[#5BC2C1]/40",
  wed: "bg-sky-100 border-sky-300 hover:bg-sky-200 dark:bg-sky-950/60 dark:border-sky-700 dark:hover:bg-sky-950/80",
  thu: "bg-[#F7D6D0] border-[#e8b8ae] hover:bg-[#f0c4bc] dark:bg-[#F7D6D0]/25 dark:border-[#e8b8ae] dark:hover:bg-[#F7D6D0]/40",
  fri: "bg-violet-100 border-violet-300 hover:bg-violet-200 dark:bg-violet-950/60 dark:border-violet-700 dark:hover:bg-violet-950/80",
  sat: "bg-[#c0dbd0] border-[#7a9f8f] hover:bg-[#aacfbe] dark:bg-[#8CB3A2]/35 dark:border-[#7a9f8f] dark:hover:bg-[#8CB3A2]/50",
  sun: "bg-[#f5c8be] border-[#d88676] hover:bg-[#eeafa3] dark:bg-[#E79989]/35 dark:border-[#d88676] dark:hover:bg-[#E79989]/50",
};

export const DAY_HEADER_TEXT_CLASS: Record<DayKey, string> = {
  mon: "text-pink-800 dark:text-pink-200",
  tue: "text-[#2a6f6e] dark:text-[#5BC2C1]",
  wed: "text-sky-800 dark:text-sky-200",
  thu: "text-[#a85f4f] dark:text-[#e8b8ae]",
  fri: "text-violet-800 dark:text-violet-200",
  sat: "text-[#4a7360] dark:text-[#8CB3A2]",
  sun: "text-[#b85545] dark:text-[#E79989]",
};

/** Filled CTA button per day — high contrast on neutral card bg. */
export const DAY_BUTTON_TONE_CLASS: Record<DayKey, string> = {
  mon: "border-0 bg-pink-600 text-white hover:bg-pink-700 dark:bg-pink-600 dark:hover:bg-pink-500",
  tue: "border-0 bg-[#2a6f6e] text-white hover:bg-[#236260] dark:bg-[#2a6f6e] dark:hover:bg-[#5BC2C1]",
  wed: "border-0 bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500",
  thu: "border-0 bg-[#a85f4f] text-white hover:bg-[#944a3d] dark:bg-[#a85f4f] dark:hover:bg-[#c07060]",
  fri: "border-0 bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500",
  sat: "border-0 bg-[#4a7360] text-white hover:bg-[#3d6150] dark:bg-[#4a7360] dark:hover:bg-[#7a9f8f]",
  sun: "border-0 bg-[#b85545] text-white hover:bg-[#a04a3c] dark:bg-[#b85545] dark:hover:bg-[#d88676]",
};

export function getDaySelectToneClass(day: DayKey): string {
  return DAY_SELECT_TONE_CLASS[day];
}

export function getDayCardToneClass(day: DayKey): string {
  return DAY_CARD_TONE_CLASS[day];
}

export function getDayHeaderTextClass(day: DayKey): string {
  return DAY_HEADER_TEXT_CLASS[day];
}

export function getDayItemToneClass(day: DayKey): string {
  return DAY_ITEM_TONE_CLASS[day];
}

export function getDayButtonToneClass(day: DayKey): string {
  return DAY_BUTTON_TONE_CLASS[day];
}
