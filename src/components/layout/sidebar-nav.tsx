"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@prisma/client";

import { NAV_SECTIONS } from "@/lib/constants/navigation";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Renders the navigation tree for a role. Hiding a link is a convenience only —
 * the authorization decision lives in the server guards (Agent rule 7).
 */
export function SidebarNav({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter((item) => hasPermission(role, item.permission));
        if (items.length === 0) return null;

        return (
          <div key={section.heading} className="space-y-1">
            <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {section.heading}
            </p>

            {items.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>

                  {item.children && active ? (
                    <div className="mt-1 space-y-1 border-l pl-6">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "block rounded-md px-3 py-1.5 text-sm transition-colors",
                            pathname === child.href
                              ? "bg-accent font-medium text-accent-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
