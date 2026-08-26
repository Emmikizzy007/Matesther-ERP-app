import { describe, expect, it } from "vitest";

import {
  ProductCategorySchema,
  ProductListParamsSchema,
  ProductSchema,
} from "@/features/products/schemas";

const UUID = "3f1c2f8a-6d0b-4f7a-9c8e-1a2b3c4d5e6f";

describe("ProductSchema", () => {
  it("keeps the price as a string and blanks empty optional fields", () => {
    const parsed = ProductSchema.parse({
      name: "Boys shirt",
      sku: "",
      categoryId: "",
      description: "",
      unit: "piece",
      sellingPrice: "4500.50",
    });

    expect(parsed).toEqual({
      name: "Boys shirt",
      sku: null,
      categoryId: null,
      description: null,
      unit: "piece",
      sellingPrice: "4500.50",
    });
  });

  it("accepts a category id and a whole-number price", () => {
    const parsed = ProductSchema.parse({
      name: "Boys trousers",
      categoryId: UUID,
      unit: "piece",
      sellingPrice: "6500",
    });

    expect(parsed.categoryId).toBe(UUID);
    expect(parsed.sellingPrice).toBe("6500");
  });

  it.each(["4500.555", "-4500", "4,500", "abc", "1e5"])("rejects the price %s", (sellingPrice) => {
    const result = ProductSchema.safeParse({ name: "Boys shirt", unit: "piece", sellingPrice });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path.join(".") === "sellingPrice")).toBe(true);
  });

  it("rejects a category id that is not a uuid", () => {
    const result = ProductSchema.safeParse({ name: "Boys shirt", unit: "piece", categoryId: "1" });

    expect(result.success).toBe(false);
  });
});

describe("ProductCategorySchema", () => {
  it("requires a name of at least two characters", () => {
    expect(ProductCategorySchema.safeParse({ name: "S" }).success).toBe(false);
    expect(ProductCategorySchema.parse({ name: " Shirts " }).name).toBe("Shirts");
  });
});

describe("ProductListParamsSchema", () => {
  it("ignores an invalid category filter rather than failing the page", () => {
    const parsed = ProductListParamsSchema.parse({ categoryId: "not-a-uuid", q: "  shirt  " });

    expect(parsed.categoryId).toBeUndefined();
    expect(parsed.q).toBe("shirt");
    expect(parsed.status).toBe("active");
  });
});
