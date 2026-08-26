import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Reports" };

export default async function Page() {
  await requirePagePermission("report:read");

  return (
    <MilestonePlaceholder
      title="Reports"
      description="Sales, production, worker, material and profitability reporting."
      milestone={10}
      scope="Revenue, profit, production throughput, worker output and material usage reports."
    />
  );
}
