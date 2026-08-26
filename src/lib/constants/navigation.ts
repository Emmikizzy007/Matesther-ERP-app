import {
  Banknote,
  BarChart3,
  Boxes,
  ClipboardList,
  Factory,
  LayoutDashboard,
  Receipt,
  Settings,
  ShoppingBag,
  Truck,
  Users,
  UserSquare2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Permission } from "@/lib/permissions";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
  /** Milestone that delivers the module; unbuilt routes render a placeholder. */
  milestone: number;
  children?: { label: string; href: string }[];
};

export type NavSection = {
  heading: string;
  items: NavItem[];
};

/**
 * Mirrors the route tree in Section 43. The sidebar is generated from this list
 * so navigation, permissions and the folder structure cannot drift apart.
 */
export const NAV_SECTIONS: readonly NavSection[] = [
  {
    heading: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "report:read",
        milestone: 1,
      },
    ],
  },
  {
    heading: "Commercial",
    items: [
      { label: "Customers", href: "/customers", icon: UserSquare2, permission: "customer:read", milestone: 2 },
      { label: "Products", href: "/products", icon: ShoppingBag, permission: "product:read", milestone: 2 },
      { label: "Orders", href: "/orders", icon: ClipboardList, permission: "order:read", milestone: 3 },
      { label: "Payments", href: "/payments", icon: Banknote, permission: "payment:read", milestone: 3 },
    ],
  },
  {
    heading: "Production",
    items: [
      {
        label: "Production",
        href: "/production",
        icon: Factory,
        permission: "production:read",
        milestone: 5,
        children: [
          { label: "Cutting", href: "/production/cutting" },
          { label: "Sewing", href: "/production/sewing" },
          { label: "Buttonholes", href: "/production/buttonholes" },
          { label: "Button tacking", href: "/production/button-tacking" },
          { label: "Ironing", href: "/production/ironing" },
          { label: "Packing", href: "/production/packing" },
        ],
      },
      { label: "Workers", href: "/workers", icon: Users, permission: "worker:read", milestone: 4 },
      { label: "Materials", href: "/materials", icon: Boxes, permission: "material:read", milestone: 6 },
      { label: "Deliveries", href: "/deliveries", icon: Truck, permission: "delivery:read", milestone: 9 },
    ],
  },
  {
    heading: "Finance & insight",
    items: [
      { label: "Expenses", href: "/expenses", icon: Receipt, permission: "expense:read", milestone: 7 },
      { label: "Reports", href: "/reports", icon: BarChart3, permission: "report:read", milestone: 10 },
      { label: "Settings", href: "/settings", icon: Settings, permission: "organization:manage", milestone: 1 },
    ],
  },
] as const;
