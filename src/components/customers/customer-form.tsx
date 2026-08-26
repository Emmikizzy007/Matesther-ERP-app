"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Field, FormAlert, SubmitButton } from "@/components/forms/form-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createCustomer, updateCustomer } from "@/features/customers/actions";
import type { CustomerDetail } from "@/features/customers/queries";
import { CUSTOMER_TYPE_LABELS, CUSTOMER_TYPES } from "@/lib/constants/customers";
import { IDLE_FORM_STATE, type FormState } from "@/lib/forms/state";

export function CustomerForm({ customer }: { customer?: CustomerDetail }) {
  const action = customer ? updateCustomer : createCustomer;
  const [state, formAction] = useActionState<FormState, FormData>(action, IDLE_FORM_STATE);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {customer ? <input type="hidden" name="customerId" value={customer.id} /> : null}

      <FormAlert message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Customer name" htmlFor="name" errors={errors?.name}>
          <Input
            id="name"
            name="name"
            defaultValue={customer?.name ?? ""}
            placeholder="ABC International School"
            required
            aria-invalid={Boolean(errors?.name)}
          />
        </Field>

        <Field label="Customer type" htmlFor="customerType" errors={errors?.customerType}>
          <NativeSelect id="customerType" name="customerType" defaultValue={customer?.customerType ?? "SCHOOL"}>
            {CUSTOMER_TYPES.map((type) => (
              <option key={type} value={type}>
                {CUSTOMER_TYPE_LABELS[type]}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <Field label="Phone" htmlFor="phone" errors={errors?.phone}>
          <Input id="phone" name="phone" defaultValue={customer?.phone ?? ""} placeholder="0803 000 0000" />
        </Field>

        <Field label="Email" htmlFor="email" errors={errors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            aria-invalid={Boolean(errors?.email)}
          />
        </Field>

        <Field
          label="Contact person"
          htmlFor="contactPerson"
          hint="The day-to-day contact. Add more people under Contacts."
          errors={errors?.contactPerson}
        >
          <Input id="contactPerson" name="contactPerson" defaultValue={customer?.contactPerson ?? ""} />
        </Field>
      </div>

      <Field label="Address" htmlFor="address" errors={errors?.address}>
        <Textarea id="address" name="address" rows={2} defaultValue={customer?.address ?? ""} />
      </Field>

      <Field label="Notes" htmlFor="notes" errors={errors?.notes}>
        <Textarea id="notes" name="notes" rows={3} defaultValue={customer?.notes ?? ""} />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton>{customer ? "Save changes" : "Create customer"}</SubmitButton>
        <Button asChild variant="ghost">
          <Link href={customer ? `/customers/${customer.id}` : "/customers"}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
