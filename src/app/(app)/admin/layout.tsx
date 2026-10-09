import type { Metadata } from "next";

import { AdminTabs } from "@/components/admin/admin-tabs";
import { PageHeader } from "@/components/app/page-header";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Every admin page also calls requireAdmin() itself — layouts don't re-run
// on soft navigation, so this one is UX, not the boundary.
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader eyebrow="Admin" title="StyleMirror AI admin" />
      <AdminTabs />
      {children}
    </div>
  );
}
