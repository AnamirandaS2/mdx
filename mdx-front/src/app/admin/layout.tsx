import { Suspense } from "react";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="min-h-full flex-1 bg-brand-lilac" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
