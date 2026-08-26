import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Deliveries" };

export default async function Page() {
  await requirePagePermission("delivery:read");

  return (
    <MilestonePlaceholder
      title="Deliveries"
      description="Packing and dispatch to customers."
      milestone={9}
      scope="Deliveries, delivery items and partial delivery history."
    />
  );
}
