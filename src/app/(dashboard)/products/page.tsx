import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Products" };

export default async function Page() {
  await requirePagePermission("product:read");

  return (
    <MilestonePlaceholder
      title="Products"
      description="The uniform catalogue and its categories."
      milestone={2}
      scope="Product catalogue, categories, SKUs and selling prices."
    />
  );
}
