import type { Metadata } from "next";

import { MilestonePlaceholder } from "@/components/layout/milestone-placeholder";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Workers" };

export default async function Page() {
  await requirePagePermission("worker:read");

  return (
    <MilestonePlaceholder
      title="Workers"
      description="Production personnel and their rates."
      milestone={4}
      scope="Worker records, specializations, payment types and worker payments."
    />
  );
}
