"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { CheckField, FormDialog, SelectField, TextField, toOptions } from "@/components/admin/form";
import { AdminSection, yesNo } from "@/components/admin/section";
import { api } from "@/lib/api/client";
import type { AdminLocation, AdminReference } from "@/lib/api/types";

type Draft = Omit<AdminLocation, "id" | "sortOrder"> & { id: number | null; sortOrder: string };

export function LocationsSection({ reference }: { reference: AdminReference }) {
  const queryClient = useQueryClient();
  const locations = useQuery({ queryKey: ["admin", "locations"], queryFn: api.admin.locations });
  const [draft, setDraft] = useState<Draft | null>(null);
  const set = (change: Partial<Draft>) => setDraft((current) => current && { ...current, ...change });
  const label = (options: AdminReference["blocks"], id: number) => options.find((option) => option.id === id)?.label;

  async function save({ id, sortOrder, ...location }: Draft) {
    await api.admin.saveLocation({ ...location, sortOrder: Number(sortOrder) }, id);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "locations"] }),
      queryClient.invalidateQueries({ queryKey: ["catalog"] }),
      queryClient.invalidateQueries({ queryKey: ["export"] }),
    ]);
  }

  return (
    <>
      <AdminSection<AdminLocation>
        description="Mã địa điểm ghi trên file Fast; block ghi trên các file thanh toán. Ba cột “dùng cho” quyết định địa điểm hiện ở tab nào."
        addLabel="Thêm địa điểm"
        rows={locations.data}
        rowKey={(location) => location.id}
        isDimmed={(location) => !location.active}
        loading={locations.isPending}
        error={locations.error}
        columns={[
          { header: "Thứ tự", cell: (location) => location.sortOrder, className: "text-right" },
          { header: "Mã", cell: (location) => <span className="font-mono text-xs">{location.code}</span> },
          { header: "Tên", cell: (location) => location.name },
          { header: "Block", cell: (location) => label(reference.blocks, location.blockId) },
          { header: "Cơ sở", cell: (location) => label(reference.sites, location.siteId) },
          { header: "T2–T6", cell: (location) => yesNo(location.onWeekday), className: "text-center" },
          { header: "Ca tối", cell: (location) => yesNo(location.onEvening), className: "text-center" },
          { header: "T7-CN", cell: (location) => yesNo(location.onWeekend), className: "text-center" },
          { header: "Đang dùng", cell: (location) => yesNo(location.active), className: "text-center" },
        ]}
        onAdd={() =>
          setDraft({ id: null, code: "", name: "", siteId: reference.sites[0].id, blockId: reference.blocks[0].id,
            onWeekday: true, onEvening: false, onWeekend: true, sortOrder: "", active: true })
        }
        onEdit={(location) => setDraft({ ...location, sortOrder: String(location.sortOrder) })}
      />
      {draft && (
        <FormDialog title={draft.id === null ? "Thêm địa điểm" : `Sửa địa điểm ${draft.code}`}
          onSubmit={() => save(draft)} onClose={() => setDraft(null)}>
          <TextField label="Mã" value={draft.code} onChange={(code) => set({ code })} />
          <TextField label="Tên" value={draft.name} onChange={(name) => set({ name })} />
          <SelectField label="Block" value={draft.blockId} options={toOptions(reference.blocks)}
            onChange={(blockId) => blockId !== null && set({ blockId })} />
          <SelectField label="Cơ sở" value={draft.siteId} options={toOptions(reference.sites)}
            onChange={(siteId) => siteId !== null && set({ siteId })} />
          <CheckField label="Dùng cho T2–T6" checked={draft.onWeekday} onChange={(onWeekday) => set({ onWeekday })} />
          <CheckField label="Dùng cho ca tối" checked={draft.onEvening} onChange={(onEvening) => set({ onEvening })} />
          <CheckField label="Dùng cho T7-CN" checked={draft.onWeekend} onChange={(onWeekend) => set({ onWeekend })} />
          <CheckField label="Đang dùng" checked={draft.active} onChange={(active) => set({ active })} />
          <TextField label="Thứ tự" type="number" value={draft.sortOrder} onChange={(sortOrder) => set({ sortOrder })} />
        </FormDialog>
      )}
    </>
  );
}
