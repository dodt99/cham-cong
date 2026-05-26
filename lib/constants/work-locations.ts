export type WorkLocation = {
  key: string;
  code: string;
  name: string;
};

const WORK_LOCATION_ENTRIES: { name: string; code: string, block: string }[] = [
  { name: "Tầng 1", code: "K1.1TD", block: "Tầng 1" },
  { name: "Siêu âm", code: "K1.2TDSA", block: "Tầng 2" },
  { name: "Xquang", code: "K1.2TDXQ", block: "Tầng 2" },
  { name: "Thang máy t3", code: "K1.3TD", block: "Tầng 3" },
  { name: "Hành lang t3", code: "K1.301306", block: "Tầng 3" },
  { name: "Nội soi tiêu hóa", code: "K1.3TH", block: "Tầng 3" },
  { name: "Điện tim", code: "K1.P322", block: "Tầng 3" },
  { name: "Siêu âm tim", code: "K1.P323", block: "Tầng 3" },
  { name: "Ca tối t3", code: "K1.P321", block: "Tầng 3" },
  { name: "Thang máy t4", code: "K1.4TD", block: "Tầng 4" },
  { name: "HL 4A", code: "K1.401406", block: "Tầng 4" },
  { name: "HL 4B", code: "K1.407412", block: "Tầng 4" },
  { name: "HL 4CD", code: "K1.414417", block: "Tầng 4" },
  { name: "HL 4CD", code: "K1.418423", block: "Tầng 4" },
  { name: "HL 5A", code: "K1.501506", block: "Tầng 5" },
  { name: "HL 5B", code: "K1.507512", block: "Tầng 5" },
  { name: "HL 5CD", code: "K1.514517", block: "Tầng 5" },
  { name: "HL 5CD", code: "K1.518523", block: "Tầng 5" },
  { name: "HL 6A", code: "K1.601606", block: "Tầng 6" },
  { name: "HL 6B", code: "K1.607612", block: "Tầng 6" },
  { name: "HL 6CD", code: "K1.614617", block: "Tầng 6" },
  { name: "HL 6CD", code: "K1.618623", block: "Tầng 6" },
  { name: "Bốt 1", code: "K1.HDV1", block: "Quầy thông tin" },
  { name: "Tầng 2 nhà P", code: "K1.HDV2", block: "Tầng 2 nhà P" },
  { name: "Tầng hầm", code: "K1.BTD", block: "Tầng B1" },
  { name: "Ca tối tầng 7", code: "K1.707-712", block: "Tầng 7" },
  { name: "Ca tối tầng 5", code: "K1.518523", block: "Tầng 5" },
  { name: "Tầng 7", code: "K1.703-706", block: "Tầng 7" },
  { name: "Tầng 7", code: "K1.707-712", block: "Tầng 7" },
];

export const WORK_LOCATIONS: WorkLocation[] = WORK_LOCATION_ENTRIES.map(
  (entry, index) => ({
    key: `${entry.code}#${index}`,
    code: entry.code,
    name: entry.name,
  }),
);

export const EVENING_WORK_LOCATIONS = WORK_LOCATIONS.filter((loc) =>
  loc.name.includes("Ca tối"),
);

export const EMPTY_LOCATION_VALUE = "__empty_location__";

const LOCATION_BY_KEY = new Map(
  WORK_LOCATIONS.map((loc) => [loc.key, loc]),
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
