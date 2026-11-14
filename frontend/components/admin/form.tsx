"use client";

import { type FormEvent, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import type { Option } from "@/lib/api/types";

/** Hộp thoại biểu mẫu: gọi `onSubmit`, hiện lỗi của máy chủ, đóng khi lưu xong. */
export function FormDialog({
  title,
  onSubmit,
  onClose,
  children,
}: {
  title: string;
  onSubmit: () => Promise<unknown>;
  onClose: () => void;
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit();
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không lưu được, vui lòng thử lại.");
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">{children}</div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
              Huỷ
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang lưu…" : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type FieldProps = { label: string; hint?: string; wide?: boolean };

function Field({ label, hint, wide, children }: FieldProps & { children: ReactNode }) {
  return (
    <label className={wide ? "grid gap-1.5 sm:col-span-2" : "grid gap-1.5"}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function TextField({
  value,
  onChange,
  type = "text",
  required = true,
  minLength,
  disabled,
  ...field
}: FieldProps & {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password" | "time" | "date" | "number";
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
}) {
  return (
    <Field {...field}>
      <Input type={type} value={value} required={required} minLength={minLength} disabled={disabled}
        onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

export function SelectField<T extends string | number>({
  value,
  options,
  onChange,
  emptyLabel,
  disabled,
  ...field
}: FieldProps & {
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (value: T | null) => void;
  /** Có giá trị này thì cho phép để trống. */
  emptyLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Field {...field}>
      <select
        value={value === null ? "" : String(value)}
        required={emptyLabel === undefined}
        disabled={disabled}
        onChange={(event) =>
          onChange(options.find((option) => String(option.value) === event.target.value)?.value ?? null)
        }
        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {(emptyLabel !== undefined || value === null) && <option value="">{emptyLabel ?? "— Chọn —"}</option>}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 rounded border-input" />
      <span>
        <span className="font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}

export const toOptions = (options: Option[]) => options.map((option) => ({ value: option.id, label: option.label }));
