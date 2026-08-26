import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Ironing queue" };

export default async function Page() {
  await requirePagePermission("production:read");

  return (
    <MilestonePlaceholder
      title="Ironing queue"
      description="Batches currently at the ironing stage."
      milestone={5}
      scope="The ironing work queue with assigned worker, quantities and expected completion."
    />
  );
}
