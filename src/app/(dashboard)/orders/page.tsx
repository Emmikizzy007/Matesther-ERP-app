import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Orders" };

export default async function Page() {
  await requirePagePermission("order:read");

  return (
    <MilestonePlaceholder
      title="Orders"
      description="The central commercial entity of the ERP."
      milestone={3}
      scope="Orders, order items, size breakdowns, balances and order status."
    />
  );
}
