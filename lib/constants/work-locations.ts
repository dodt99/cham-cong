export type WorkLocation = {
  key: string;
  code: string;
  name: string;
};

const WORK_LOCATION_ENTRIES: { name: string; code: string }[] = [
  { name: "Tầng 1", code: "K1.1TD" },
  { name: "Siêu âm", code: "K1.2TDSA" },
  { name: "Xquang", code: "K1.2TDXQ" },
  { name: "Thang máy t3", code: "K1.3TD" },
  { name: "Hành lang t3", code: "K1.301306" },
  { name: "Nội soi tiêu hóa", code: "K1.3TH" },
  { name: "Điện tim", code: "K1.P322" },
  { name: "Siêu âm tim", code: "K1.P323" },
  { name: "Ca tối t3", code: "K1.P321" },
  { name: "Thang máy t4", code: "K1.4TD" },
  { name: "HL 4A", code: "K1.401406" },
  { name: "HL 4B", code: "K1.407412" },
  { name: "HL 4CD", code: "K1.414417" },
  { name: "HL 4CD", code: "K1.418423" },
  { name: "HL 5A", code: "K1.501506" },
  { name: "HL 5B", code: "K1.507512" },
  { name: "HL 5CD", code: "K1.514517" },
  { name: "HL 5CD", code: "K1.518523" },
  { name: "HL 6A", code: "K1.601606" },
  { name: "HL 6B", code: "K1.607612" },
  { name: "HL 6CD", code: "K1.614617" },
  { name: "HL 6CD", code: "K1.618623" },
  { name: "Bốt 1", code: "K1.HDV1" },
  { name: "Tầng 2 nhà P", code: "K1.HDV2" },
  { name: "Tầng hầm", code: "K1.BTD" },
  { name: "Ca tối tầng 7", code: "K1.707-712" },
  { name: "Ca tối tầng 5", code: "K1.518523" },
  { name: "Tầng 7", code: "K1.703-706" },
  { name: "Tầng 7", code: "K1.707-712" },
];

export const WORK_LOCATIONS: WorkLocation[] = WORK_LOCATION_ENTRIES.map(
  (entry, index) => ({
    key: `${entry.code}#${index}`,
    code: entry.code,
    name: entry.name,
  }),
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
