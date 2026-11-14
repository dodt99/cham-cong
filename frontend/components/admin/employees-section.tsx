"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { FormDialog, SelectField, TextField, toOptions } from "@/components/admin/form";
import { AdminSection } from "@/components/admin/section";
import { api } from "@/lib/api/client";
import type { AdminEmployee, AdminReference } from "@/lib/api/types";
import { formatDayShort, toISODate } from "@/lib/week";

const MEMBERSHIP_OPTIONS: { value: AdminEmployee["membership"]; label: string }[] = [
  { value: "CORE", label: "Đội chính — xếp ca cả tuần, có trên mọi file" },
  { value: "SUPPORT", label: "Tăng cường — chỉ ca tối và T7-CN" },
];

type Draft = Omit<AdminEmployee, "employeeId" | "sortOrder"> & { employeeId: number | null; sortOrder: string };

const formatDate = (isoDate: string | null) => (isoDate ? `${formatDayShort(isoDate)}/${isoDate.slice(0, 4)}` : "—");

export function EmployeesSection({ reference }: { reference: AdminReference }) {
  const queryClient = useQueryClient();
  const employees = useQuery({ queryKey: ["admin", "employees"], queryFn: api.admin.employees });
  const [draft, setDraft] = useState<Draft | null>(null);
  const set = (change: Partial<Draft>) => setDraft((current) => current && { ...current, ...change });
  const today = toISODate(new Date());

  async function save({ employeeId, sortOrder, ...employee }: Draft) {
    await api.admin.saveEmployee(
      { ...employee, sortOrder: sortOrder === "" ? null : Number(sortOrder) },
      employeeId,
    );
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "employees"] }),
      queryClient.invalidateQueries({ queryKey: ["week"] }),
      queryClient.invalidateQueries({ queryKey: ["export"] }),
    ]);
  }

  return (
    <>
      <AdminSection<AdminEmployee>
        description="Nhân viên nghỉ việc thì điền “Làm đến ngày”: họ biến mất khỏi các tuần sau đó nhưng vẫn còn trong tuần cũ. Thứ tự quyết định thứ tự hiển thị và thứ tự trên file xuất."
        addLabel="Thêm nhân viên"
        rows={employees.data}
        rowKey={(employee) => employee.employeeId}
        isDimmed={(employee) => employee.activeTo !== null && employee.activeTo < today}
        loading={employees.isPending}
        error={employees.error}
        columns={[
          { header: "Thứ tự", cell: (employee) => employee.sortOrder, className: "text-right" },
          { header: "Mã NV", cell: (employee) => <span className="font-mono text-xs">{employee.code}</span> },
          { header: "Họ và tên", cell: (employee) => employee.fullName },
          { header: "MST", cell: (employee) => <span className="font-mono text-xs">{employee.taxCode}</span> },
          { header: "Nhóm", cell: (employee) => (employee.membership === "CORE" ? "Đội chính" : "Tăng cường") },
          {
            header: "Chức danh",
            cell: (employee) =>
              reference.positions.find((position) => position.id === employee.positionId)?.label.split(" — ")[0],
          },
          { header: "Làm từ", cell: (employee) => formatDate(employee.activeFrom) },
          { header: "Làm đến", cell: (employee) => formatDate(employee.activeTo) },
        ]}
        onAdd={() =>
          setDraft({ employeeId: null, code: "", fullName: "", taxCode: "", membership: "CORE",
            positionId: reference.positions[0].id, sortOrder: "", activeFrom: null, activeTo: null })
        }
        onEdit={(employee) => setDraft({ ...employee, sortOrder: String(employee.sortOrder) })}
      />
      {draft && (
        <FormDialog title={draft.employeeId === null ? "Thêm nhân viên" : `Sửa ${draft.fullName}`}
          onSubmit={() => save(draft)} onClose={() => setDraft(null)}>
          <TextField label="Mã NV" value={draft.code} onChange={(code) => set({ code })} />
          <TextField label="Mã số thuế" value={draft.taxCode} onChange={(taxCode) => set({ taxCode })} />
          <TextField label="Họ và tên" wide value={draft.fullName} onChange={(fullName) => set({ fullName })} />
          <SelectField label="Nhóm" wide value={draft.membership} options={MEMBERSHIP_OPTIONS}
            onChange={(membership) => membership && set({ membership })} />
          <SelectField label="Chức danh" wide value={draft.positionId} options={toOptions(reference.positions)}
            onChange={(positionId) => positionId !== null && set({ positionId })}
            hint="In ở cột Chức danh và Công việc của file Làm sớm." />
          <TextField label="Làm từ ngày" type="date" required={false} value={draft.activeFrom ?? ""}
            onChange={(value) => set({ activeFrom: value || null })} />
          <TextField label="Làm đến ngày" type="date" required={false} value={draft.activeTo ?? ""}
            onChange={(value) => set({ activeTo: value || null })} />
          <TextField label="Thứ tự" type="number" required={draft.employeeId !== null} value={draft.sortOrder}
            onChange={(sortOrder) => set({ sortOrder })}
            hint={draft.employeeId === null ? "Để trống = xếp cuối nhóm." : undefined} />
        </FormDialog>
      )}
    </>
  );
}
