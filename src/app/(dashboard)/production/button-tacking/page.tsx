import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Button tacking queue" };

export default async function Page() {
  await requirePagePermission("production:read");

  return (
    <MilestonePlaceholder
      title="Button tacking queue"
      description="Batches currently at the button tacking stage."
      milestone={5}
      scope="The button tacking work queue with assigned worker, quantities and expected completion."
    />
  );
}
