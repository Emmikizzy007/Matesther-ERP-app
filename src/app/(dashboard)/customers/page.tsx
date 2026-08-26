import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ListToolbar } from "@/components/data/list-toolbar";
import { PaginationControls } from "@/components/data/pagination-controls";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCustomers } from "@/features/customers/queries";
import { CustomerListParamsSchema } from "@/features/customers/schemas";
import { requirePagePermission } from "@/lib/auth/guards";
import { CUSTOMER_TYPES, CUSTOMER_TYPE_LABELS } from "@/lib/constants/customers";
import { STATUS_FILTER_OPTIONS } from "@/lib/constants/lists";
import { hasPermission } from "@/lib/permissions";
import { firstValue, type RawSearchParams } from "@/lib/query/search-params";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const session = await requirePagePermission("customer:read");
  const raw = await searchParams;

  const params = CustomerListParamsSchema.parse({
    page: firstValue(raw.page) ?? 1,
    pageSize: firstValue(raw.pageSize) ?? undefined,
    q: firstValue(raw.q) ?? "",
    type: firstValue(raw.type),
    status: firstValue(raw.status) ?? "active",
  });

  const { rows, meta } = await listCustomers(params);
  const canWrite = hasPermission(session.role, "customer:write");

  const linkParams = {
    q: params.q || undefined,
    type: params.type,
    status: params.status === "active" ? undefined : params.status,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Schools, companies, organizations and individuals you produce for."
      >
        {canWrite ? (
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="mr-1.5 h-4 w-4" aria-hidden />
              New customer
            </Link>
          </Button>
        ) : null}
      </PageHeader>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <ListToolbar
            searchPlaceholder="Search name, phone, email or contact person"
            searchValue={params.q}
            selects={[
              {
                name: "type",
                label: "Customer type",
                value: params.type ?? "",
                options: [
                  { value: "", label: "All types" },
                  ...CUSTOMER_TYPES.map((type) => ({
                    value: type,
                    label: CUSTOMER_TYPE_LABELS[type],
                  })),
                ],
              },
              {
                name: "status",
                label: "Status",
                value: params.status,
                options: STATUS_FILTER_OPTIONS,
              },
            ]}
          />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Contact person</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No customers match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {customer.name}
                        </Link>
                      </TableCell>
                      <TableCell>{CUSTOMER_TYPE_LABELS[customer.customerType]}</TableCell>
                      <TableCell>{customer.phone ?? "—"}</TableCell>
                      <TableCell>{customer.contactPerson ?? "—"}</TableCell>
                      <TableCell className="text-right tabular-nums">{customer.contactCount}</TableCell>
                      <TableCell>
                        <Badge variant={customer.isActive ? "default" : "secondary"}>
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls meta={meta} searchParams={linkParams} label="customers" />
        </CardContent>
      </Card>
    </div>
  );
}
