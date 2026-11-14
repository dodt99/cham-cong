"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { EmployeesSection } from "@/components/admin/employees-section";
import { LocationsSection } from "@/components/admin/locations-section";
import { ShiftsSection } from "@/components/admin/shifts-section";
import { UsersSection } from "@/components/admin/users-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api/client";
import { useMe } from "@/lib/schedule/queries";

/** Quản trị người dùng và danh mục — chỉ ADMIN. */
export function AdminPage() {
  const me = useMe();
  const isAdmin = me.data?.role === "ADMIN";
  const reference = useQuery({ queryKey: ["admin", "reference"], queryFn: api.admin.reference, enabled: isAdmin });

  if (me.isPending || (isAdmin && reference.isPending)) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Đang tải dữ liệu...</div>;
  }
  if (!isAdmin || !reference.data) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert" className="text-sm text-destructive">
          {me.error?.message ?? reference.error?.message ?? "Chỉ tài khoản quản trị mới vào được trang này."}
        </p>
        <Button asChild variant="outline">
          <Link href="/">Về trang xếp ca</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-full flex-col gap-4 p-4 sm:gap-6 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Xếp ca
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">Quản trị</h1>
      </header>
      <Tabs defaultValue="employees" className="w-full min-w-0">
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="employees">Nhân viên</TabsTrigger>
          <TabsTrigger value="shifts">Ca làm việc</TabsTrigger>
          <TabsTrigger value="locations">Địa điểm</TabsTrigger>
          <TabsTrigger value="users">Tài khoản</TabsTrigger>
        </TabsList>
        <TabsContent value="employees" className="min-w-0"><EmployeesSection reference={reference.data} /></TabsContent>
        <TabsContent value="shifts" className="min-w-0"><ShiftsSection reference={reference.data} /></TabsContent>
        <TabsContent value="locations" className="min-w-0"><LocationsSection reference={reference.data} /></TabsContent>
        <TabsContent value="users" className="min-w-0"><UsersSection /></TabsContent>
      </Tabs>
    </main>
  );
}
