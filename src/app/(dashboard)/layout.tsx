import { redirect } from "next/navigation";

import { Brand } from "@/components/layout/brand";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Topbar } from "@/components/layout/topbar";
import { getCurrentUser } from "@/features/auth/queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // A valid cookie for a deleted or deactivated user must not reach the app.
  if (!user) redirect("/login");

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col border-r bg-muted/20 lg:flex">
        <Brand businessName={user.organization.businessName} />
        <SidebarNav role={user.role} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <Topbar user={user} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
