import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { ContactsPanel } from "@/components/customers/contacts-panel";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setCustomerActive } from "@/features/customers/actions";
import { getCustomer } from "@/features/customers/queries";
import { requirePagePermission } from "@/lib/auth/guards";
import { CUSTOMER_TYPE_LABELS } from "@/lib/constants/customers";
import { NotFoundError } from "@/lib/errors";
import { hasPermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Customer" };

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="whitespace-pre-line text-sm">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const session = await requirePagePermission("customer:read");
  const { customerId } = await params;

  const customer = await getCustomer(customerId).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  const canWrite = hasPermission(session.role, "customer:write");

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={`${CUSTOMER_TYPE_LABELS[customer.customerType]} · added ${customer.createdAt.toLocaleDateString("en-GB")}`}
      >
        <div className="flex items-center gap-2">
          <Badge variant={customer.isActive ? "default" : "secondary"}>
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>

          {canWrite ? (
            <>
              <Button asChild variant="outline">
                <Link href={`/customers/${customer.id}/edit`}>
                  <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
                  Edit
                </Link>
              </Button>

              <form action={setCustomerActive}>
                <input type="hidden" name="customerId" value={customer.id} />
                <input type="hidden" name="isActive" value={customer.isActive ? "false" : "true"} />
                <Button type="submit" variant={customer.isActive ? "outline" : "default"}>
                  {customer.isActive ? "Deactivate" : "Reactivate"}
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
            <CardDescription>Primary record for this customer.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="Phone" value={customer.phone} />
            <DetailRow label="Email" value={customer.email} />
            <DetailRow label="Contact person" value={customer.contactPerson} />
            <DetailRow label="Type" value={CUSTOMER_TYPE_LABELS[customer.customerType]} />
            <div className="sm:col-span-2">
              <DetailRow label="Address" value={customer.address} />
            </div>
            <div className="sm:col-span-2">
              <DetailRow label="Notes" value={customer.notes} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contacts</CardTitle>
            <CardDescription>People to call about orders, fittings and delivery.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactsPanel
              customerId={customer.id}
              contacts={customer.contacts}
              canWrite={canWrite}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
