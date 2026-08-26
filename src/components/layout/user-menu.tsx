import { LogOut } from "lucide-react";

import { logout } from "@/features/auth/actions";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/features/auth/queries";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({ user }: { user: CurrentUser }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
      </Avatar>

      <span className="hidden min-w-0 sm:block">
        <span className="block truncate text-sm font-medium leading-tight">{user.name}</span>
        <span className="block text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</span>
      </span>

      <form action={logout}>
        <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
          <LogOut className="size-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
