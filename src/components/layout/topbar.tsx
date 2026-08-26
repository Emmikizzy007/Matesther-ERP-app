import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import type { CurrentUser } from "@/features/auth/queries";

export function Topbar({ user }: { user: CurrentUser }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-8">
      <MobileSidebar role={user.role} businessName={user.organization.businessName} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.organization.businessName}</p>
        <p className="truncate text-xs text-muted-foreground">
          Uniform manufacturing ERP &middot; {user.organization.currency}
        </p>
      </div>

      <UserMenu user={user} />
    </header>
  );
}
