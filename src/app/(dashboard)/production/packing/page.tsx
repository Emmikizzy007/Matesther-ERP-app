import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Packing queue" };

export default async function Page() {
  await requirePagePermission("production:read");

  return (
    <MilestonePlaceholder
      title="Packing queue"
      description="Batches currently at the packing stage."
      milestone={5}
      scope="The packing work queue with assigned worker, quantities and expected completion."
    />
  );
}
