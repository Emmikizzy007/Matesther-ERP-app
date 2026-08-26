import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationCurrency } from "@/features/organization/queries";
import { setProductActive } from "@/features/products/actions";
import { getProduct } from "@/features/products/queries";
import { requirePagePermission } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";
import { formatMoney } from "@/lib/format/money";
import { hasPermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Product" };

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="whitespace-pre-line text-sm">{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const session = await requirePagePermission("product:read");
  const { productId } = await params;

  const product = await getProduct(productId).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });
  const currency = await getOrganizationCurrency();

  const canWrite = hasPermission(session.role, "product:write");

  return (
    <div className="space-y-6">
      <PageHeader title={product.name} description={product.categoryName ?? "Uncategorised"}>
        <div className="flex items-center gap-2">
          <Badge variant={product.isActive ? "default" : "secondary"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>

          {canWrite ? (
            <>
              <Button asChild variant="outline">
                <Link href={`/products/${product.id}/edit`}>
                  <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
                  Edit
                </Link>
              </Button>

              <form action={setProductActive}>
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="isActive" value={product.isActive ? "false" : "true"} />
                <Button type="submit" variant={product.isActive ? "outline" : "default"}>
                  {product.isActive ? "Deactivate" : "Reactivate"}
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Catalogue details</CardTitle>
          <CardDescription>Used when adding this item to an order.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <DetailRow label="SKU" value={product.sku} />
          <DetailRow label="Unit" value={product.unit} />
          <DetailRow label="Selling price" value={formatMoney(product.sellingPrice, currency)} />
          <DetailRow label="Category" value={product.categoryName} />
          <div className="sm:col-span-2">
            <DetailRow label="Description" value={product.description} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
