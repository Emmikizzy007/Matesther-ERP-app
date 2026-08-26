import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ProductForm } from "@/components/products/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { getOrganizationCurrency } from "@/features/organization/queries";
import { listCategories } from "@/features/products/queries";
import { requirePagePermission } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requirePagePermission("product:write");

  const [categories, currency] = await Promise.all([listCategories(), getOrganizationCurrency()]);

  return (
    <div className="space-y-6">
      <PageHeader title="New product" description="Add a uniform item to the catalogue." />

      <Card>
        <CardContent className="pt-6">
          <ProductForm categories={categories} currency={currency} />
        </CardContent>
      </Card>
    </div>
  );
}
