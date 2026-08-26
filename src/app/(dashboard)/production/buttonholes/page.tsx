import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Buttonholes queue" };

export default async function Page() {
  await requirePagePermission("production:read");

  return (
    <MilestonePlaceholder
      title="Buttonholes queue"
      description="Batches currently at the buttonholes stage."
      milestone={5}
      scope="The buttonholes work queue with assigned worker, quantities and expected completion."
    />
  );
}
