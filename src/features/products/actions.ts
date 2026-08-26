"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ValidationError } from "@/lib/errors";
import {
  errorState,
  fieldErrorState,
  successState,
  uniqueConstraintMessage,
  type FormState,
} from "@/lib/forms/state";
import { ProductCategorySchema, ProductSchema } from "@/features/products/schemas";

type ProductField = keyof z.infer<typeof ProductSchema>;
type CategoryField = keyof z.infer<typeof ProductCategorySchema>;

const IdSchema = z.string().uuid();

function productFields(formData: FormData) {
  return {
    name: formData.get("name") ?? "",
    sku: formData.get("sku") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    description: formData.get("description") ?? "",
    unit: formData.get("unit") ?? "piece",
    sellingPrice: formData.get("sellingPrice") ?? "",
  };
}

/** A product may only point at a category owned by the same organization. */
async function resolveCategoryId(categoryId: string | null, organizationId: string): Promise<string | null> {
  if (!categoryId) return null;

  const category = await prisma.productCategory.findFirst({
    where: { id: categoryId, organizationId },
    select: { id: true },
  });
  if (!category) throw new ValidationError("Choose a category from your organization.");

  return category.id;
}

function toDecimal(value: string | null): Prisma.Decimal | null {
  return value === null ? null : new Prisma.Decimal(value);
}

export async function createProduct(
  _prev: FormState<ProductField>,
  formData: FormData,
): Promise<FormState<ProductField>> {
  const session = await requirePermission("product:write");
  const parsed = ProductSchema.safeParse(productFields(formData));
  if (!parsed.success) return fieldErrorState<ProductField>(parsed.error);

  const { categoryId, sellingPrice, ...rest } = parsed.data;

  let productId: string;
  try {
    const created = await prisma.product.create({
      data: {
        ...rest,
        sellingPrice: toDecimal(sellingPrice),
        categoryId: await resolveCategoryId(categoryId, session.organizationId),
        organizationId: session.organizationId,
      },
      select: { id: true },
    });
    productId = created.id;
  } catch (error) {
    if (error instanceof ValidationError) return errorState<ProductField>(error.message);
    const message = uniqueConstraintMessage(error, "Could not save this product.");
    if (message) return errorState<ProductField>(message);
    throw error;
  }

  revalidatePath("/products");
  redirect(`/products/${productId}`);
}

export async function updateProduct(
  _prev: FormState<ProductField>,
  formData: FormData,
): Promise<FormState<ProductField>> {
  const session = await requirePermission("product:write");

  const productId = IdSchema.safeParse(formData.get("productId"));
  if (!productId.success) return errorState<ProductField>("Missing product reference.");

  const parsed = ProductSchema.safeParse(productFields(formData));
  if (!parsed.success) return fieldErrorState<ProductField>(parsed.error);

  const existing = await prisma.product.findFirst({
    where: { id: productId.data, organizationId: session.organizationId },
    select: { id: true },
  });
  if (!existing) throw new NotFoundError("Product not found.");

  const { categoryId, sellingPrice, ...rest } = parsed.data;

  try {
    await prisma.product.update({
      where: { id: productId.data },
      data: {
        ...rest,
        sellingPrice: toDecimal(sellingPrice),
        categoryId: await resolveCategoryId(categoryId, session.organizationId),
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) return errorState<ProductField>(error.message);
    const message = uniqueConstraintMessage(error, "Could not save this product.");
    if (message) return errorState<ProductField>(message);
    throw error;
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId.data}`);
  redirect(`/products/${productId.data}`);
}

/** Catalogue items are deactivated so historic orders keep resolving (Section 57). */
export async function setProductActive(formData: FormData): Promise<void> {
  const session = await requirePermission("product:write");

  const productId = IdSchema.parse(formData.get("productId"));
  const isActive = formData.get("isActive") === "true";

  const updated = await prisma.product.updateMany({
    where: { id: productId, organizationId: session.organizationId },
    data: { isActive },
  });
  if (updated.count === 0) throw new NotFoundError("Product not found.");

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);
}

export async function createProductCategory(
  _prev: FormState<CategoryField>,
  formData: FormData,
): Promise<FormState<CategoryField>> {
  const session = await requirePermission("product:write");

  const parsed = ProductCategorySchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return fieldErrorState<CategoryField>(parsed.error);

  try {
    await prisma.productCategory.create({
      data: { ...parsed.data, organizationId: session.organizationId },
    });
  } catch (error) {
    const message = uniqueConstraintMessage(error, "Could not save this category.");
    if (message) return errorState<CategoryField>(message);
    throw error;
  }

  revalidatePath("/products/categories");
  revalidatePath("/products");
  return successState<CategoryField>();
}

/**
 * Deleting a category leaves its products uncategorised (the FK is SET NULL)
 * rather than removing catalogue rows.
 */
export async function deleteProductCategory(formData: FormData): Promise<void> {
  const session = await requirePermission("product:write");

  const categoryId = IdSchema.parse(formData.get("categoryId"));

  await prisma.productCategory.deleteMany({
    where: { id: categoryId, organizationId: session.organizationId },
  });

  revalidatePath("/products/categories");
  revalidatePath("/products");
}
