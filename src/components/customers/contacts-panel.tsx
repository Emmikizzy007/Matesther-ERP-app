"use client";

import { Pencil, Star, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Field, FormAlert, SubmitButton } from "@/components/forms/form-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteCustomerContact, saveCustomerContact } from "@/features/customers/actions";
import type { CustomerDetail } from "@/features/customers/queries";
import { IDLE_FORM_STATE, type FormState } from "@/lib/forms/state";

type Contact = CustomerDetail["contacts"][number];

function ContactForm({
  customerId,
  contact,
  onDone,
}: {
  customerId: string;
  contact?: Contact;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(saveCustomerContact, IDLE_FORM_STATE);
  const errors = state.fieldErrors;

  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state.status, onDone]);

  return (
    <form action={formAction} className="space-y-4 rounded-md border border-dashed p-4" noValidate>
      <input type="hidden" name="customerId" value={customerId} />
      {contact ? <input type="hidden" name="contactId" value={contact.id} /> : null}

      <FormAlert message={state.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="contact-name" errors={errors?.name}>
          <Input id="contact-name" name="name" defaultValue={contact?.name ?? ""} required />
        </Field>

        <Field label="Phone" htmlFor="contact-phone" errors={errors?.phone}>
          <Input id="contact-phone" name="phone" defaultValue={contact?.phone ?? ""} required />
        </Field>

        <Field label="Email" htmlFor="contact-email" errors={errors?.email}>
          <Input id="contact-email" name="email" type="email" defaultValue={contact?.email ?? ""} />
        </Field>

        <Field label="Position" htmlFor="contact-position" errors={errors?.position}>
          <Input
            id="contact-position"
            name="position"
            defaultValue={contact?.position ?? ""}
            placeholder="Bursar"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPrimary"
          defaultChecked={contact?.isPrimary ?? false}
          className="h-4 w-4 rounded border-input"
        />
        Primary contact for this customer
      </label>

      <div className="flex items-center gap-3">
        <SubmitButton size="sm">{contact ? "Save contact" : "Add contact"}</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ContactsPanel({
  customerId,
  contacts,
  canWrite,
}: {
  customerId: string;
  contacts: Contact[];
  canWrite: boolean;
}) {
  const [mode, setMode] = useState<{ kind: "closed" } | { kind: "add" } | { kind: "edit"; id: string }>({
    kind: "closed",
  });

  const editing = mode.kind === "edit" ? contacts.find((contact) => contact.id === mode.id) : undefined;

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No contacts recorded yet.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {contact.name}
                  {contact.isPrimary ? (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" aria-hidden />
                      Primary
                    </Badge>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[contact.position, contact.phone, contact.email].filter(Boolean).join(" · ")}
                </p>
              </div>

              {canWrite ? (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode({ kind: "edit", id: contact.id })}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden />
                    Edit
                  </Button>

                  <form action={deleteCustomerContact}>
                    <input type="hidden" name="customerId" value={customerId} />
                    <input type="hidden" name="contactId" value={contact.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="mr-1 h-3.5 w-3.5" aria-hidden />
                      Remove
                    </Button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canWrite ? (
        mode.kind === "closed" ? (
          <Button type="button" variant="outline" size="sm" onClick={() => setMode({ kind: "add" })}>
            Add contact
          </Button>
        ) : (
          <ContactForm
            key={editing?.id ?? "new"}
            customerId={customerId}
            contact={editing}
            onDone={() => setMode({ kind: "closed" })}
          />
        )
      ) : null}
    </div>
  );
}
