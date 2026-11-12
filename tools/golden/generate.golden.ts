/**
 * Generates the golden .xlsx files that the v2 backend export tests compare against.
 *
 * Runs the UNMODIFIED v1 export code (lib/export/*) for every scenario under
 * backend/src/test/resources/golden/<name>/input.json and writes the four workbooks next to it.
 * The v1 fill functions are browser code, so fetch / Blob download are stubbed to the filesystem.
 *
 *   npm run golden
 */
import fs from "node:fs";
import path from "node:path";
import { expect, test, vi } from "vitest";

import { buildAttendanceRows } from "@/lib/export/build-attendance-rows";
import { buildEarlyAttendanceRows } from "@/lib/export/build-early-attendance-rows";
import { buildEveningAttendanceRows } from "@/lib/export/build-evening-attendance-rows";
import { buildWeekendAttendanceRows } from "@/lib/export/build-weekend-attendance-rows";
import { fillAndDownloadAttendanceExcel } from "@/lib/export/fill-attendance-workbook";
import { fillAndDownloadEarlyAttendanceExcel } from "@/lib/export/fill-early-attendance-workbook";
import { fillAndDownloadEveningAttendanceExcel } from "@/lib/export/fill-evening-attendance-workbook";
import { fillAndDownloadWeekendAttendanceExcel } from "@/lib/export/fill-weekend-attendance-workbook";
import { createEmptyWeekSheet } from "@/lib/storage/attendance-storage";
import type { DayEntry, DayKey, WeekSheet } from "@/lib/types/attendance";

const ROOT = path.resolve(__dirname, "../..");
const GOLDEN_DIR = path.join(ROOT, "backend/src/test/resources/golden");

type ScenarioInput = {
  weekStart: string;
  rows: Record<string, Partial<Record<DayKey, Partial<DayEntry>>>>;
};

function toWeekSheet(input: ScenarioInput): WeekSheet {
  const sheet = createEmptyWeekSheet(input.weekStart);
  for (const [employeeId, days] of Object.entries(input.rows)) {
    const row = sheet.rows[employeeId];
    if (!row) throw new Error(`Unknown employee ${employeeId}`);
    for (const [day, entry] of Object.entries(days)) {
      row.days[day as DayKey] = { ...row.days[day as DayKey], ...entry };
    }
  }
  return sheet;
}

let downloaded: Blob | null = null;

vi.stubGlobal("fetch", async (url: string) => {
  return new Response(fs.readFileSync(path.join(ROOT, "public", url)));
});
vi.stubGlobal("document", {
  createElement: () => ({ href: "", download: "", click() {} }),
});
URL.createObjectURL = (blob: Blob) => {
  downloaded = blob;
  return "blob:golden";
};
URL.revokeObjectURL = () => {};

async function capture(run: () => Promise<void>, target: string): Promise<void> {
  downloaded = null;
  await run();
  if (!downloaded) throw new Error(`No download captured for ${target}`);
  fs.writeFileSync(target, Buffer.from(await (downloaded as Blob).arrayBuffer()));
}

const scenarios = fs
  .readdirSync(GOLDEN_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

test.each(scenarios)("golden: %s", async (name) => {
  const dir = path.join(GOLDEN_DIR, name);
  const input: ScenarioInput = JSON.parse(fs.readFileSync(path.join(dir, "input.json"), "utf8"));
  const sheet = toWeekSheet(input);
  const week = sheet.weekStart;

  await capture(() => fillAndDownloadAttendanceExcel(buildAttendanceRows(sheet), week), path.join(dir, "fast.xlsx"));
  await capture(() => fillAndDownloadEarlyAttendanceExcel(buildEarlyAttendanceRows(sheet), week), path.join(dir, "early.xlsx"));
  await capture(() => fillAndDownloadEveningAttendanceExcel(buildEveningAttendanceRows(sheet), week), path.join(dir, "evening.xlsx"));
  await capture(() => fillAndDownloadWeekendAttendanceExcel(buildWeekendAttendanceRows(sheet), week), path.join(dir, "weekend.xlsx"));

  expect(fs.existsSync(path.join(dir, "weekend.xlsx"))).toBe(true);
});
