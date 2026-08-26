"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, FormAlert, SubmitButton } from "@/components/forms/form-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/features/products/actions";
import type { CategoryOption, ProductDetail } from "@/features/products/queries";
import { IDLE_FORM_STATE, type FormState } from "@/lib/forms/state";

export function ProductForm({
  product,
  categories,
  currency,
}: {
  product?: ProductDetail;
  categories: CategoryOption[];
  currency: string;
}) {
  const action = product ? updateProduct : createProduct;
  const [state, formAction] = useActionState<FormState, FormData>(action, IDLE_FORM_STATE);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}

      <FormAlert message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Product name" htmlFor="name" errors={errors?.name}>
          <Input
            id="name"
            name="name"
            defaultValue={product?.name ?? ""}
            placeholder="Boys shirt — short sleeve"
            required
            aria-invalid={Boolean(errors?.name)}
          />
        </Field>

        <Field label="SKU" htmlFor="sku" hint="Optional, unique within your organization." errors={errors?.sku}>
          <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} placeholder="SHIRT-SS-BOY" />
        </Field>

        <Field label="Category" htmlFor="categoryId" errors={errors?.categoryId}>
          <NativeSelect id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""}>
            <option value="">Uncategorised</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Unit" htmlFor="unit" hint="piece, set, pair, metre…" errors={errors?.unit}>
          <Input id="unit" name="unit" defaultValue={product?.unit ?? "piece"} required />
        </Field>

        <Field
          label={`Selling price (${currency})`}
          htmlFor="sellingPrice"
          hint="Leave blank if the price is quoted per order."
          errors={errors?.sellingPrice}
        >
          <Input
            id="sellingPrice"
            name="sellingPrice"
            inputMode="decimal"
            defaultValue={product?.sellingPrice ?? ""}
            placeholder="4500.00"
            aria-invalid={Boolean(errors?.sellingPrice)}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor="description" errors={errors?.description}>
        <Textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton>{product ? "Save changes" : "Create product"}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href={product ? `/products/${product.id}` : "/products"}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
