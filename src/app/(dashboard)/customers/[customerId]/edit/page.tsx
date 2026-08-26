import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getCustomer } from "@/features/customers/queries";
import { requirePagePermission } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";

export const metadata: Metadata = { title: "Edit customer" };

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  await requirePagePermission("customer:write");
  const { customerId } = await params;

  const customer = await getCustomer(customerId).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${customer.name}`} description="Update this customer's record." />

      <Card>
        <CardContent className="pt-6">
          <CustomerForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
