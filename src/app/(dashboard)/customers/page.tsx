import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Customers" };

export default async function Page() {
  await requirePagePermission("customer:read");

  return (
    <MilestonePlaceholder
      title="Customers"
      description="Schools, companies, organizations and individuals."
      milestone={2}
      scope="Customer and contact records with search, filtering and pagination."
    />
  );
}
