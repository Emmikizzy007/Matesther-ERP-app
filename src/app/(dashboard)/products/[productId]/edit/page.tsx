import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizationCurrency } from "@/features/organization/queries";
import { getProduct, listCategories } from "@/features/products/queries";
import { requirePagePermission } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requirePagePermission("product:write");
  const { productId } = await params;

  const product = await getProduct(productId).catch((error: unknown) => {
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  const [categories, currency] = await Promise.all([listCategories(), getOrganizationCurrency()]);

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${product.name}`} description="Update this catalogue item." />

      <Card>
        <CardContent className="pt-6">
          <ProductForm product={product} categories={categories} currency={currency} />
        </CardContent>
      </Card>
    </div>
  );
}
