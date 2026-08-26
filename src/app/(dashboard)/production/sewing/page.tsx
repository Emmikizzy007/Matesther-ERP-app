import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Sewing queue" };

export default async function Page() {
  await requirePagePermission("production:read");

  return (
    <MilestonePlaceholder
      title="Sewing queue"
      description="Batches currently at the sewing stage."
      milestone={5}
      scope="The sewing work queue with assigned worker, quantities and expected completion."
    />
  );
}
