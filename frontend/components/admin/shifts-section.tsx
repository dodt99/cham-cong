"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { CheckField, FormDialog, SelectField, TextField, toOptions } from "@/components/admin/form";
import { AdminSection, yesNo } from "@/components/admin/section";
import { api } from "@/lib/api/client";
import type { AdminReference, AdminShift, Slot } from "@/lib/api/types";
import { shiftHours } from "@/lib/schedule/model";

const SLOT_OPTIONS: { value: Slot; label: string }[] = [
  { value: "MAIN", label: "Ca chính trong ngày" },
  { value: "EVENING", label: "Ca tối tăng cường" },
];

type Draft = Omit<AdminShift, "id" | "sortOrder" | "usageCount"> & { id: number | null; sortOrder: string };

/** "06:00:00" → "06:00" cho ô nhập giờ. */
const clock = (time: string | null) => (time ? time.slice(0, 5) : "");

const toDraft = (shift: AdminShift): Draft => ({
  id: shift.id,
  code: shift.code,
  startTime: clock(shift.startTime),
  endTime: clock(shift.endTime),
  slot: shift.slot,
  halfDay: shift.halfDay,
  onWeekday: shift.onWeekday,
  onWeekend: shift.onWeekend,
  siteId: shift.siteId,
  earlyEligible: shift.earlyEligible,
  earlyEndTime: shift.earlyEndTime && clock(shift.earlyEndTime),
  sortOrder: String(shift.sortOrder),
  active: shift.active,
});

export function ShiftsSection({ reference }: { reference: AdminReference }) {
  const queryClient = useQueryClient();
  const shifts = useQuery({ queryKey: ["admin", "shifts"], queryFn: api.admin.shifts });
  const [draft, setDraft] = useState<Draft | null>(null);
  const set = (change: Partial<Draft>) => setDraft((current) => current && { ...current, ...change });
  const siteName = (siteId: number | null) =>
    siteId === null ? "—" : reference.sites.find((site) => site.id === siteId)?.label;

  // Ca đã được xếp: sửa mã / giờ / cách tính làm sớm sẽ đổi luôn các tuần đã xếp, nên báo trước khi lưu.
  const original = draft && shifts.data?.find((shift) => shift.id === draft.id);
  const usageCount = original?.usageCount ?? 0;
  const changesScheduledWeeks = Boolean(
    draft && original && usageCount > 0 && (
      draft.code.trim() !== original.code ||
      draft.startTime !== clock(original.startTime) ||
      draft.endTime !== clock(original.endTime) ||
      draft.halfDay !== original.halfDay ||
      draft.earlyEligible !== original.earlyEligible ||
      (draft.earlyEndTime ?? "") !== clock(original.earlyEndTime)
    ),
  );

  async function save({ id, sortOrder, ...shift }: Draft) {
    await api.admin.saveShift({ ...shift, sortOrder: Number(sortOrder) }, id);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "shifts"] }),
      queryClient.invalidateQueries({ queryKey: ["catalog"] }),
      queryClient.invalidateQueries({ queryKey: ["export"] }),
    ]);
  }

  return (
    <>
      <AdminSection<AdminShift>
        description="Ca thôi dùng thì bỏ chọn “Đang dùng”: không xếp mới được nữa nhưng các tuần đã xếp vẫn giữ nguyên. Một mã ca có thể có hai dòng: cả ngày và nghỉ chiều (ví dụ 2K43)."
        addLabel="Thêm ca"
        rows={shifts.data}
        rowKey={(shift) => shift.id}
        isDimmed={(shift) => !shift.active}
        loading={shifts.isPending}
        error={shifts.error}
        columns={[
          { header: "Thứ tự", cell: (shift) => shift.sortOrder, className: "text-right" },
          { header: "Mã ca", cell: (shift) => <span className="font-mono text-xs">{shift.code}</span> },
          { header: "Khung giờ", cell: (shift) => shiftHours(shift) },
          { header: "Loại", cell: (shift) => (shift.slot === "EVENING" ? "Ca tối" : shift.halfDay ? "Nghỉ chiều" : "Cả ngày") },
          { header: "T2–T6", cell: (shift) => yesNo(shift.onWeekday), className: "text-center" },
          { header: "T7-CN", cell: (shift) => yesNo(shift.onWeekend), className: "text-center" },
          { header: "Cơ sở", cell: (shift) => siteName(shift.siteId) },
          { header: "Tính làm sớm", cell: (shift) => yesNo(shift.earlyEligible), className: "text-center" },
          { header: "Đang dùng", cell: (shift) => yesNo(shift.active), className: "text-center" },
          { header: "Đã xếp", cell: (shift) => (shift.usageCount > 0 ? `${shift.usageCount} lần` : "—"), className: "text-right" },
        ]}
        onAdd={() =>
          setDraft({ id: null, code: "", startTime: "06:00", endTime: "16:30", slot: "MAIN", halfDay: false,
            onWeekday: true, onWeekend: false, siteId: null, earlyEligible: true, earlyEndTime: null,
            sortOrder: "", active: true })
        }
        onEdit={(shift) => setDraft(toDraft(shift))}
      />
      {draft && (
        <FormDialog title={draft.id === null ? "Thêm ca" : `Sửa ca ${draft.code}`} onSubmit={() => save(draft)}
          onClose={() => setDraft(null)}>
          <TextField label="Mã ca" value={draft.code} onChange={(code) => set({ code })}
            hint="Mã ghi trên file Fast." />
          <TextField label="Thứ tự" type="number" value={draft.sortOrder} onChange={(sortOrder) => set({ sortOrder })} />
          <TextField label="Giờ bắt đầu" type="time" value={draft.startTime}
            onChange={(startTime) => set({ startTime })} />
          <TextField label="Giờ kết thúc" type="time" value={draft.endTime} onChange={(endTime) => set({ endTime })} />
          <SelectField label="Loại ca" value={draft.slot} options={SLOT_OPTIONS} disabled={usageCount > 0}
            hint={usageCount > 0 ? "Ca đã được xếp nên không đổi được loại." : undefined}
            onChange={(slot) => slot && set({ slot, halfDay: slot === "EVENING" ? false : draft.halfDay })} />
          <SelectField label="Chỉ dùng ở cơ sở" value={draft.siteId} options={toOptions(reference.sites)}
            emptyLabel="Không giới hạn" onChange={(siteId) => set({ siteId })}
            hint="Cảnh báo khi xếp với địa điểm của cơ sở khác." />
          <CheckField label="Dùng cho T2–T6" checked={draft.onWeekday} onChange={(onWeekday) => set({ onWeekday })} />
          <CheckField label="Dùng cho T7-CN" checked={draft.onWeekend} onChange={(onWeekend) => set({ onWeekend })} />
          {draft.slot === "MAIN" && (
            <CheckField label="Ca nghỉ chiều" hint="Ghi chú “Nghỉ chiều” trên file Fast và Làm sớm."
              checked={draft.halfDay} onChange={(halfDay) => set({ halfDay })} />
          )}
          <CheckField label="Tính làm sớm" hint="Có dòng trên file Làm sớm." checked={draft.earlyEligible}
            onChange={(earlyEligible) => set({ earlyEligible })} />
          <TextField label="Giờ kết thúc trên file Làm sớm" type="time" required={false}
            value={draft.earlyEndTime ?? ""} onChange={(value) => set({ earlyEndTime: value || null })}
            hint="Để trống = dùng giờ kết thúc ca. Ca nghỉ chiều thường ghi 16:30." />
          <CheckField label="Đang dùng" checked={draft.active} onChange={(active) => set({ active })} />
          {changesScheduledWeeks && (
            <p role="status" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:col-span-2 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
              Ca này đã được xếp {usageCount} lần. Thay đổi về mã, giờ hoặc cách tính làm sớm sẽ áp dụng cho cả những
              tuần đã xếp — file xuất lại của các tuần đó sẽ khác trước. Nếu chỉ muốn áp dụng từ nay, hãy tạo ca mới
              và bỏ chọn “Đang dùng” ở ca này.
            </p>
          )}
        </FormDialog>
      )}
    </>
  );
}
