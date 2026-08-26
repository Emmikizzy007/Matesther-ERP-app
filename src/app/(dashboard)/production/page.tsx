import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Production" };

export default async function Page() {
  await requirePagePermission("production:read");

  return (
    <MilestonePlaceholder
      title="Production"
      description="Batches moving through the manufacturing pipeline."
      milestone={5}
      scope="Workflows, batches, operations, worker assignment and the operation state machine."
    />
  );
}
