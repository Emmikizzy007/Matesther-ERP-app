import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Payments" };

export default async function Page() {
  await requirePagePermission("payment:read");

  return (
    <MilestonePlaceholder
      title="Payments"
      description="Customer payments against orders."
      milestone={3}
      scope="Payment capture with derived amount paid and balance due per order."
    />
  );
}
