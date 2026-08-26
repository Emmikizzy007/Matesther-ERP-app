"use client";

import { useActionState, useEffect, useRef } from "react";

import { Field, FormAlert, SubmitButton } from "@/components/forms/form-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProductCategory } from "@/features/products/actions";
import { IDLE_FORM_STATE, type FormState } from "@/lib/forms/state";

export function CategoryForm() {
  const [state, formAction] = useActionState<FormState, FormData>(
    createProductCategory,
    IDLE_FORM_STATE,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields after a save so several categories can be added in a row.
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      <FormAlert message={state.message} />

      <Field label="Category name" htmlFor="category-name" errors={state.fieldErrors?.name}>
        <Input id="category-name" name="name" placeholder="Shirts" required />
      </Field>

      <Field label="Description" htmlFor="category-description" errors={state.fieldErrors?.description}>
        <Textarea id="category-description" name="description" rows={2} />
      </Field>

      <SubmitButton size="sm">Add category</SubmitButton>
    </form>
  );
}
