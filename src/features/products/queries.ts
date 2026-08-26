import { Prisma } from "@prisma/client";

import { requirePagePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";
import { resolvePage, skipFor, type PageMeta } from "@/lib/query/pagination";
import type { ProductListParams } from "@/features/products/schemas";

export type ProductListRow = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  /** Decimal serialised to a string before it reaches any client component. */
  sellingPrice: string | null;
  isActive: boolean;
  categoryName: string | null;
};

export type ProductDetail = {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  description: string | null;
  unit: string;
  sellingPrice: string | null;
  isActive: boolean;
  categoryName: string | null;
};

export type CategoryOption = { id: string; name: string; productCount: number };

function whereFor(organizationId: string, params: ProductListParams): Prisma.ProductWhereInput {
  return {
    organizationId,
    ...(params.status === "all" ? {} : { isActive: params.status === "active" }),
    ...(params.categoryId ? { categoryId: params.categoryId } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { sku: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function listProducts(
  params: ProductListParams,
): Promise<{ rows: ProductListRow[]; meta: PageMeta }> {
  const session = await requirePagePermission("product:read");
  const where = whereFor(session.organizationId, params);

  const total = await prisma.product.count({ where });
  const meta = resolvePage(params.page, total, params.pageSize);

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ name: "asc" }],
    skip: skipFor(meta.page, meta.pageSize),
    take: meta.pageSize,
    select: {
      id: true,
      name: true,
      sku: true,
      unit: true,
      sellingPrice: true,
      isActive: true,
      category: { select: { name: true } },
    },
  });

  return {
    rows: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      sellingPrice: product.sellingPrice?.toFixed(2) ?? null,
      isActive: product.isActive,
      categoryName: product.category?.name ?? null,
    })),
    meta,
  };
}

export async function getProduct(productId: string): Promise<ProductDetail> {
  const session = await requirePagePermission("product:read");

  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId: session.organizationId },
    select: {
      id: true,
      name: true,
      sku: true,
      categoryId: true,
      description: true,
      unit: true,
      sellingPrice: true,
      isActive: true,
      category: { select: { name: true } },
    },
  });

  if (!product) throw new NotFoundError("Product not found.");

  return {
    ...product,
    sellingPrice: product.sellingPrice?.toFixed(2) ?? null,
    categoryName: product.category?.name ?? null,
  };
}

export async function listCategories(): Promise<CategoryOption[]> {
  const session = await requirePagePermission("product:read");

  const categories = await prisma.productCategory.findMany({
    where: { organizationId: session.organizationId },
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, _count: { select: { products: true } } },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    productCount: category._count.products,
  }));
}
