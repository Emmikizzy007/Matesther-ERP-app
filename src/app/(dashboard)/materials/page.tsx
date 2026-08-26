import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Materials" };

export default async function Page() {
  await requirePagePermission("material:read");

  return (
    <MilestonePlaceholder
      title="Materials"
      description="Fabric, accessories and packaging stock."
      milestone={6}
      scope="Materials, suppliers, purchases, stock movements, consumption and waste."
    />
  );
}
