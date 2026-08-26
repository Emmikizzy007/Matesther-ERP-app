import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Cutting queue" };

export default async function Page() {
  await requirePagePermission("production:read");

  return (
    <MilestonePlaceholder
      title="Cutting queue"
      description="Batches currently at the cutting stage."
      milestone={5}
      scope="The cutting work queue with assigned worker, quantities and expected completion."
    />
  );
}
