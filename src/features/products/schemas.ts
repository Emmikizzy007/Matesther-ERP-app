import { z } from "zod";

import { PaginationParamsSchema } from "@/lib/query/pagination";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .default(null);

/**
 * Prices stay in string form through validation and are handed to Prisma as a
 * Decimal, so no monetary value passes through a float (Agent rule 8).
 */
const MoneySchema = z
  .union([
    z.literal(""),
    z
      .string()
      .trim()
      .regex(/^\d{1,12}(\.\d{1,2})?$/, "Enter an amount like 4500 or 4500.50"),
  ])
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .default(null);

export const ProductSchema = z.object({
  name: z.string().trim().min(2, "Product name is required.").max(150),
  sku: optionalText(50),
  categoryId: z
    .union([z.literal(""), z.string().uuid("Choose a valid category.")])
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .default(null),
  description: optionalText(2000),
  unit: z.string().trim().min(1, "Unit is required.").max(30).default("piece"),
  sellingPrice: MoneySchema,
});

export type ProductInput = z.infer<typeof ProductSchema>;

export const ProductCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(100),
  description: optionalText(2000),
});

export type ProductCategoryInput = z.infer<typeof ProductCategorySchema>;

export const ProductListParamsSchema = PaginationParamsSchema.extend({
  q: z.string().trim().max(200).catch("").default(""),
  categoryId: z.string().uuid().optional().catch(undefined),
  status: z.enum(["active", "inactive", "all"]).catch("active"),
});

export type ProductListParams = z.infer<typeof ProductListParamsSchema>;
