export type WorkLocation = {
  key: string;
  code: string;
  name: string;
  block: string;
};

export enum WorkLocationType {
  NORMAL = "NORMAL",
  EVENING = "EVENING",
  WEEKEND = "WEEKEND",
}

type WorkLocationEntry = {
  type: WorkLocationType;
  code: string;
  name: string;
  block: string;
};

const WORK_LOCATION_ENTRIES: WorkLocationEntry[] = [
  // Normal
  { type: WorkLocationType.NORMAL, name: "Tầng 1", code: "K1.1TD", block: "Tầng 1" },
  { type: WorkLocationType.NORMAL, name: "Siêu âm", code: "K1.2TDSA", block: "Tầng 2" },
  { type: WorkLocationType.NORMAL, name: "Xquang", code: "K1.2TDXQ", block: "Tầng 2" },
  { type: WorkLocationType.NORMAL, name: "T3", code: "K1.3TD", block: "Tầng 3" },
  { type: WorkLocationType.NORMAL, name: "3A", code: "K1.301306", block: "Tầng 3" },
  { type: WorkLocationType.NORMAL, name: "NSTH", code: "K1.3TH", block: "Tầng 3" },
  { type: WorkLocationType.NORMAL, name: "P322", code: "K1.P322", block: "Tầng 3" },
  { type: WorkLocationType.NORMAL, name: "P323", code: "K1.P323", block: "Tầng 3" },
  { type: WorkLocationType.NORMAL, name: "T4", code: "K1.4TD", block: "Tầng 4" },
  { type: WorkLocationType.NORMAL, name: "4A", code: "K1.401406", block: "Tầng 4" },
  { type: WorkLocationType.NORMAL, name: "4B", code: "K1.407412", block: "Tầng 4" },
  { type: WorkLocationType.NORMAL, name: "4CD", code: "K1.414417", block: "Tầng 4" },
  { type: WorkLocationType.NORMAL, name: "4CD", code: "K1.418423", block: "Tầng 4" },
  { type: WorkLocationType.NORMAL, name: "P430", code: "K1.P430", block: "Tầng 4" },
  { type: WorkLocationType.NORMAL, name: "T5", code: "K1.5TD", block: "Tầng 5" },
  { type: WorkLocationType.NORMAL, name: "5A", code: "K1.501506", block: "Tầng 5" },
  { type: WorkLocationType.NORMAL, name: "5B", code: "K1.507512", block: "Tầng 5" },
  { type: WorkLocationType.NORMAL, name: "5CD", code: "K1.514517", block: "Tầng 5" },
  { type: WorkLocationType.NORMAL, name: "5CD", code: "K1.518523", block: "Tầng 5" },
  { type: WorkLocationType.NORMAL, name: "P530", code: "K1.P530", block: "Tầng 5" },
  { type: WorkLocationType.NORMAL, name: "T6", code: "K1.6TD", block: "Tầng 6" },
  { type: WorkLocationType.NORMAL, name: "6A", code: "K1.601606", block: "Tầng 6" },
  { type: WorkLocationType.NORMAL, name: "6B", code: "K1.607612", block: "Tầng 6" },
  { type: WorkLocationType.NORMAL, name: "6CD", code: "K1.614617", block: "Tầng 6" },
  { type: WorkLocationType.NORMAL, name: "6CD", code: "K1.618623", block: "Tầng 6" },
  { type: WorkLocationType.NORMAL, name: "P630", code: "K1.P630", block: "Tầng 6" },
  { type: WorkLocationType.NORMAL, name: "Bốt 1", code: "K1.HDV1", block: "Quầy thông tin" },
  { type: WorkLocationType.NORMAL, name: "Nhà P", code: "K1.HDV2", block: "Tầng 2 nhà P" },
  { type: WorkLocationType.NORMAL, name: "B1", code: "K1.BTD", block: "Tầng B1" },
  { type: WorkLocationType.NORMAL, name: "7C", code: "K1.703-706", block: "Tầng 7" },
  { type: WorkLocationType.NORMAL, name: "7D", code: "K1.707-712", block: "Tầng 7" },
  // Evening
  { type: WorkLocationType.EVENING, name: "Siêu âm", code: "K1.2TDSA", block: "Tầng 2" },
  { type: WorkLocationType.EVENING, name: "P321", code: "K1.P321", block: "Tầng 3" },
  { type: WorkLocationType.EVENING, name: "5CD", code: "K1.518523", block: "Tầng 5" },
  { type: WorkLocationType.EVENING, name: "7D", code: "K1.707-712", block: "Tầng 7" },
  { type: WorkLocationType.EVENING, name: "B1", code: "K1.BTD", block: "Tầng B1" },
  // Weekend
  { type: WorkLocationType.WEEKEND, name: "Tầng 1", code: "K1.1TD", block: "Tầng 1" },
  { type: WorkLocationType.WEEKEND, name: "Siêu âm", code: "K1.2TDSA", block: "Tầng 2" },
  { type: WorkLocationType.WEEKEND, name: "P322", code: "K1.P322", block: "Tầng 3" },
  { type: WorkLocationType.WEEKEND, name: "P323", code: "K1.P323", block: "Tầng 3" },
  { type: WorkLocationType.WEEKEND, name: "Bốt 1", code: "K1.HDV1", block: "Quầy thông tin" },
];

function toWorkLocation(entry: WorkLocationEntry): WorkLocation {
  return {
    key: `${entry.type}-${entry.code}`,
    code: entry.code,
    name: entry.name,
    block: entry.block,
  };
}

const ALL_WORK_LOCATIONS = WORK_LOCATION_ENTRIES.map(toWorkLocation);

function locationsByType(type: WorkLocationType): WorkLocation[] {
  return WORK_LOCATION_ENTRIES.filter((entry) => entry.type === type).map(
    toWorkLocation,
  );
}

/** Ngày thường (T2–T6) */
export const WORK_LOCATIONS = locationsByType(WorkLocationType.NORMAL);

/** Ca tối */
export const EVENING_WORK_LOCATIONS = locationsByType(WorkLocationType.EVENING);

/** Cuối tuần (T7, CN) */
export const WEEKEND_WORK_LOCATIONS = locationsByType(WorkLocationType.WEEKEND);

export type WorkLocationSelectVariant = "default" | "evening" | "weekend";

const VARIANT_LOCATIONS: Record<WorkLocationSelectVariant, WorkLocation[]> = {
  default: WORK_LOCATIONS,
  evening: EVENING_WORK_LOCATIONS,
  weekend: WEEKEND_WORK_LOCATIONS,
};

export function getWorkLocationsForVariant(
  variant: WorkLocationSelectVariant,
): WorkLocation[] {
  return VARIANT_LOCATIONS[variant];
}

export const EMPTY_LOCATION_VALUE = "__empty_location__";

const LOCATION_BY_KEY = new Map(
  ALL_WORK_LOCATIONS.map((loc) => [loc.key, loc]),
);

export function getWorkLocationByKey(
  key: string,
): WorkLocation | undefined {
  return LOCATION_BY_KEY.get(key);
}

export function getWorkLocationCode(key: string | null): string | null {
  if (!key) return null;
  return getWorkLocationByKey(key)?.code ?? null;
}

export function getWorkLocationBlock(key: string | null): string | null {
  if (!key) return null;
  return getWorkLocationByKey(key)?.block ?? null;
}

export function getWorkLocationPriority(block: string | null): number {
  if (!block) return Infinity;
  return EVENING_WORK_LOCATIONS.findIndex((loc) => loc.block === block) + 1 || Infinity;
}
