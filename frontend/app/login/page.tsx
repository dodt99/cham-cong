"use client";

import { type FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api/client";

function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const next = useSearchParams().get("next");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await api.login(username.trim(), password);
      queryClient.clear();
      queryClient.setQueryData(["me"], user);
      // Chỉ quay lại đường dẫn nội bộ.
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không đăng nhập được, vui lòng thử lại.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold">Chấm công HDV</h1>
        <p className="mt-1 text-sm text-muted-foreground">Đăng nhập để xếp ca và xuất file.</p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="username">Tên đăng nhập</Label>
        <Input id="username" autoComplete="username" autoFocus required value={username}
          onChange={(event) => setUsername(event.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" type="password" autoComplete="current-password" required value={password}
          onChange={(event) => setPassword(event.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
