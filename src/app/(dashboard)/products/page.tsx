import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Tags } from "lucide-react";

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
import { getOrganizationCurrency } from "@/features/organization/queries";
import { listCategories, listProducts } from "@/features/products/queries";
import { ProductListParamsSchema } from "@/features/products/schemas";
import { requirePagePermission } from "@/lib/auth/guards";
import { STATUS_FILTER_OPTIONS } from "@/lib/constants/lists";
import { formatMoney } from "@/lib/format/money";
import { hasPermission } from "@/lib/permissions";
import { firstValue, type RawSearchParams } from "@/lib/query/search-params";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const session = await requirePagePermission("product:read");
  const raw = await searchParams;

  const params = ProductListParamsSchema.parse({
    page: firstValue(raw.page) ?? 1,
    pageSize: firstValue(raw.pageSize) ?? undefined,
    q: firstValue(raw.q) ?? "",
    categoryId: firstValue(raw.categoryId),
    status: firstValue(raw.status) ?? "active",
  });

  const [{ rows, meta }, categories, currency] = await Promise.all([
    listProducts(params),
    listCategories(),
    getOrganizationCurrency(),
  ]);

  const canWrite = hasPermission(session.role, "product:write");

  const linkParams = {
    q: params.q || undefined,
    categoryId: params.categoryId,
    status: params.status === "active" ? undefined : params.status,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Uniform items you manufacture, with prices and categories.">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/products/categories">
              <Tags className="mr-1.5 h-4 w-4" aria-hidden />
              Categories
            </Link>
          </Button>

          {canWrite ? (
            <Button asChild>
              <Link href="/products/new">
                <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                New product
              </Link>
            </Button>
          ) : null}
        </div>
      </PageHeader>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <ListToolbar
            searchPlaceholder="Search name, SKU or description"
            searchValue={params.q}
            selects={[
              {
                name: "categoryId",
                label: "Category",
                value: params.categoryId ?? "",
                options: [
                  { value: "", label: "All categories" },
                  ...categories.map((category) => ({ value: category.id, label: category.name })),
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Selling price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No products match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <Link href={`/products/${product.id}`} className="underline-offset-4 hover:underline">
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.sku ?? "—"}</TableCell>
                      <TableCell>{product.categoryName ?? "Uncategorised"}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(product.sellingPrice, currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <PaginationControls meta={meta} searchParams={linkParams} label="products" />
        </CardContent>
      </Card>
    </div>
  );
}
