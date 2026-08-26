import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Expenses" };

export default async function Page() {
  await requirePagePermission("expense:read");

  return (
    <MilestonePlaceholder
      title="Expenses"
      description="Operating costs and order-specific spend."
      milestone={7}
      scope="Expenses, expense categories, production costs and order costing."
    />
  );
}
