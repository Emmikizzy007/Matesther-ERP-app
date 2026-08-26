import type { Metadata } from "next";

import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "New customer" };

export default async function NewCustomerPage() {
  await requirePagePermission("customer:write");

  return (
    <div className="space-y-6">
      <PageHeader title="New customer" description="Create a school, company, organization or individual." />

      <Card>
        <CardContent className="pt-6">
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
