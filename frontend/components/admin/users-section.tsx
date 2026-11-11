"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { CheckField, FormDialog, SelectField, TextField } from "@/components/admin/form";
import { AdminSection } from "@/components/admin/section";
import { api } from "@/lib/api/client";
import type { Role, UserAccount } from "@/lib/api/types";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Quản trị — mọi quyền" },
  { value: "EDITOR", label: "Xếp ca — nhập liệu và xuất file" },
  { value: "VIEWER", label: "Chỉ xem — xem và xuất file" },
];
const roleLabel = (role: Role) => ROLE_OPTIONS.find((option) => option.value === role)!.label.split(" — ")[0];

type Draft = { id: number | null; username: string; fullName: string; role: Role; active: boolean; password: string };

export function UsersSection() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ["admin", "users"], queryFn: api.admin.users });
  const [draft, setDraft] = useState<Draft | null>(null);
  const set = (change: Partial<Draft>) => setDraft((current) => current && { ...current, ...change });

  async function save(user: Draft) {
    if (user.id === null) {
      await api.admin.createUser({ username: user.username.trim(), fullName: user.fullName.trim(), role: user.role,
        password: user.password });
    } else {
      await api.admin.updateUser(user.id, { fullName: user.fullName.trim(), role: user.role, active: user.active,
        password: user.password || null });
    }
    await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  }

  return (
    <>
      <AdminSection<UserAccount>
        description="Tài khoản đăng nhập của quản lý. Tài khoản ngừng dùng thì bỏ chọn “Đang hoạt động” thay vì xoá."
        addLabel="Thêm tài khoản"
        rows={users.data}
        rowKey={(user) => user.id}
        isDimmed={(user) => !user.active}
        loading={users.isPending}
        error={users.error}
        columns={[
          { header: "Tên đăng nhập", cell: (user) => <span className="font-mono text-xs">{user.username}</span> },
          { header: "Họ tên", cell: (user) => user.fullName },
          { header: "Quyền", cell: (user) => roleLabel(user.role) },
          { header: "Trạng thái", cell: (user) => (user.active ? "Đang hoạt động" : "Đã khoá") },
        ]}
        onAdd={() => setDraft({ id: null, username: "", fullName: "", role: "EDITOR", active: true, password: "" })}
        onEdit={(user) => setDraft({ ...user, password: "" })}
      />
      {draft && (
        <FormDialog title={draft.id === null ? "Thêm tài khoản" : `Sửa tài khoản ${draft.username}`}
          onSubmit={() => save(draft)} onClose={() => setDraft(null)}>
          <TextField label="Tên đăng nhập" value={draft.username} disabled={draft.id !== null}
            onChange={(username) => set({ username })} />
          <TextField label="Họ tên" value={draft.fullName} onChange={(fullName) => set({ fullName })} />
          <SelectField label="Quyền" wide value={draft.role} options={ROLE_OPTIONS}
            onChange={(role) => role && set({ role })} />
          <TextField label={draft.id === null ? "Mật khẩu" : "Mật khẩu mới"} type="password" wide minLength={8}
            required={draft.id === null} value={draft.password} onChange={(password) => set({ password })}
            hint={draft.id === null ? "Ít nhất 8 ký tự." : "Để trống nếu không đổi. Ít nhất 8 ký tự."} />
          {draft.id !== null && (
            <CheckField label="Đang hoạt động" hint="Bỏ chọn để khoá tài khoản." checked={draft.active}
              onChange={(active) => set({ active })} />
          )}
        </FormDialog>
      )}
    </>
  );
}
