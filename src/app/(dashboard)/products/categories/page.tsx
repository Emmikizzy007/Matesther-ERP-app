import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { CategoryForm } from "@/components/products/category-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteProductCategory } from "@/features/products/actions";
import { listCategories } from "@/features/products/queries";
import { requirePagePermission } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Product categories" };

export default async function ProductCategoriesPage() {
  const session = await requirePagePermission("product:read");
  const categories = await listCategories();
  const canWrite = hasPermission(session.role, "product:write");

  return (
    <div className="space-y-6">
      <PageHeader title="Product categories" description="Group catalogue items for filtering and reporting.">
        <Button asChild variant="outline">
          <Link href="/products">Back to products</Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
            <CardDescription>
              Removing a category leaves its products in the catalogue, uncategorised.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {categories.map((category) => (
                  <li key={category.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.productCount} {category.productCount === 1 ? "product" : "products"}
                      </p>
                    </div>

                    {canWrite ? (
                      <form action={deleteProductCategory}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden />
                          Remove
                        </Button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {canWrite ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add category</CardTitle>
              <CardDescription>Names are unique within your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
