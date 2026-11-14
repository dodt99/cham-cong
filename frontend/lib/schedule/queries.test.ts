import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { api, ApiError } from "@/lib/api/client";
import type { Assignment, CellContent, CellRef, WeekView } from "@/lib/api/types";
import { writeCell } from "@/lib/schedule/queries";

vi.mock("@/lib/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/client")>()),
  api: { putCell: vi.fn(), deleteCell: vi.fn() },
}));

const WEEK = "2026-05-04";
const putCell = vi.mocked(api.putCell);
const deleteCell = vi.mocked(api.deleteCell);

const shift = (shiftId: number): CellContent => ({ shiftId, offTypeId: null, locationId: null });
const onServer = (ref: CellRef, content: CellContent, version: number): Assignment => ({ id: 1, ...ref, ...content, version });
const unreachable = () => new ApiError(0, "NETWORK", "Không kết nối được máy chủ.");

// Trạng thái ghi nằm ở cấp module và theo từng ô, nên mỗi test dùng một nhân viên riêng.
let nextEmployeeId = 1;

function openWeek() {
  const queryClient = new QueryClient();
  const ref: CellRef = { employeeId: nextEmployeeId++, date: WEEK, slot: "MAIN" };
  queryClient.setQueryData<WeekView>(["week", WEEK], { weekStart: WEEK, days: [WEEK], members: [], assignments: [] });
  const shown = () =>
    queryClient.getQueryData<WeekView>(["week", WEEK])!.assignments.find((a) => a.employeeId === ref.employeeId);
  const write = (content: CellContent | null) => writeCell(queryClient, WEEK, ref, content);
  return { ref, shown, write };
}

describe("writeCell", () => {
  beforeEach(() => {
    putCell.mockReset();
    deleteCell.mockReset();
  });

  it("shows the new value at once and sends the version the server last reported", async () => {
    const { ref, shown, write } = openWeek();
    putCell.mockResolvedValueOnce(onServer(ref, shift(7), 0)).mockResolvedValueOnce(onServer(ref, shift(4), 1));

    const first = write(shift(7));
    expect(shown()?.shiftId).toBe(7);
    await first;
    expect(putCell).toHaveBeenLastCalledWith(ref, shift(7), null);

    await write(shift(4));
    expect(putCell).toHaveBeenLastCalledWith(ref, shift(4), 0);
    expect(shown()).toMatchObject({ shiftId: 4, version: 1 });
  });

  it("queues quick edits of one cell so each uses the version of the one before", async () => {
    const { ref, shown, write } = openWeek();
    putCell.mockResolvedValueOnce(onServer(ref, shift(1), 0)).mockResolvedValueOnce(onServer(ref, shift(2), 1));

    const first = write(shift(1));
    const second = write(shift(2));
    expect(shown()?.shiftId).toBe(2);
    await Promise.all([first, second]);

    expect(putCell.mock.calls.map(([, content, version]) => [content.shiftId, version])).toEqual([[1, null], [2, 0]]);
    expect(shown()).toMatchObject({ shiftId: 2, version: 1 });
  });

  it("puts an edited cell back to its saved value when the save fails", async () => {
    const { ref, shown, write } = openWeek();
    putCell.mockResolvedValueOnce(onServer(ref, shift(7), 0));
    await write(shift(7));

    putCell.mockRejectedValueOnce(unreachable());
    const failing = write(shift(4));
    expect(shown()?.shiftId).toBe(4);
    await failing;
    expect(shown()).toMatchObject({ shiftId: 7, version: 0 });

    // Lần ghi sau vẫn gửi phiên bản đang có trên máy chủ.
    putCell.mockResolvedValueOnce(onServer(ref, shift(4), 1));
    await write(shift(4));
    expect(putCell).toHaveBeenLastCalledWith(ref, shift(4), 0);
  });

  it("empties a new cell again when its first save fails", async () => {
    const { shown, write } = openWeek();
    putCell.mockRejectedValueOnce(unreachable());

    await write(shift(7));

    expect(shown()).toBeUndefined();
  });

  it("brings a cleared cell back when the delete fails", async () => {
    const { ref, shown, write } = openWeek();
    putCell.mockResolvedValueOnce(onServer(ref, shift(7), 0));
    await write(shift(7));

    deleteCell.mockRejectedValueOnce(unreachable());
    const failing = write(null);
    expect(shown()).toBeUndefined();
    await failing;

    expect(deleteCell).toHaveBeenCalledWith(ref, 0);
    expect(shown()).toMatchObject({ shiftId: 7, version: 0 });
  });

  it("shows what the server holds after a conflict and continues from that version", async () => {
    const { ref, shown, write } = openWeek();
    putCell.mockRejectedValueOnce(
      new ApiError(409, "VERSION_CONFLICT", "Ô này vừa được người khác thay đổi.", onServer(ref, shift(9), 3)),
    );

    await write(shift(7));
    expect(shown()).toMatchObject({ shiftId: 9, version: 3 });

    putCell.mockResolvedValueOnce(onServer(ref, shift(7), 4));
    await write(shift(7));
    expect(putCell).toHaveBeenLastCalledWith(ref, shift(7), 3);
  });
});
