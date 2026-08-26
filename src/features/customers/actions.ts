"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { withTransaction } from "@/lib/db/transactions";
import { NotFoundError } from "@/lib/errors";
import {
  errorState,
  fieldErrorState,
  successState,
  uniqueConstraintMessage,
  type FormState,
} from "@/lib/forms/state";
import { CustomerContactSchema, CustomerSchema } from "@/features/customers/schemas";

type CustomerField = keyof z.infer<typeof CustomerSchema>;
type ContactField = keyof z.infer<typeof CustomerContactSchema>;

const IdSchema = z.string().uuid();

/** Confirms the record belongs to the caller's organization before mutating it. */
async function assertCustomerInOrganization(customerId: string, organizationId: string): Promise<void> {
  const found = await prisma.customer.findFirst({
    where: { id: customerId, organizationId },
    select: { id: true },
  });
  if (!found) throw new NotFoundError("Customer not found.");
}

function customerFields(formData: FormData) {
  return {
    name: formData.get("name") ?? "",
    customerType: formData.get("customerType") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    address: formData.get("address") ?? "",
    contactPerson: formData.get("contactPerson") ?? "",
    notes: formData.get("notes") ?? "",
  };
}

export async function createCustomer(
  _prev: FormState<CustomerField>,
  formData: FormData,
): Promise<FormState<CustomerField>> {
  const session = await requirePermission("customer:write");
  const parsed = CustomerSchema.safeParse(customerFields(formData));
  if (!parsed.success) return fieldErrorState<CustomerField>(parsed.error);

  let customerId: string;
  try {
    const created = await prisma.customer.create({
      data: { ...parsed.data, organizationId: session.organizationId },
      select: { id: true },
    });
    customerId = created.id;
  } catch (error) {
    const message = uniqueConstraintMessage(error, "Could not save this customer.");
    if (message) return errorState<CustomerField>(message);
    throw error;
  }

  revalidatePath("/customers");
  redirect(`/customers/${customerId}`);
}

export async function updateCustomer(
  _prev: FormState<CustomerField>,
  formData: FormData,
): Promise<FormState<CustomerField>> {
  const session = await requirePermission("customer:write");

  const customerId = IdSchema.safeParse(formData.get("customerId"));
  if (!customerId.success) return errorState<CustomerField>("Missing customer reference.");

  const parsed = CustomerSchema.safeParse(customerFields(formData));
  if (!parsed.success) return fieldErrorState<CustomerField>(parsed.error);

  await assertCustomerInOrganization(customerId.data, session.organizationId);

  try {
    await prisma.customer.update({ where: { id: customerId.data }, data: parsed.data });
  } catch (error) {
    const message = uniqueConstraintMessage(error, "Could not save this customer.");
    if (message) return errorState<CustomerField>(message);
    throw error;
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId.data}`);
  redirect(`/customers/${customerId.data}`);
}

/**
 * Customers are deactivated, never deleted, so their order history stays intact
 * (Section 57, Agent rule 9).
 */
export async function setCustomerActive(formData: FormData): Promise<void> {
  const session = await requirePermission("customer:write");

  const customerId = IdSchema.parse(formData.get("customerId"));
  const isActive = formData.get("isActive") === "true";

  await assertCustomerInOrganization(customerId, session.organizationId);
  await prisma.customer.update({ where: { id: customerId }, data: { isActive } });

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
}

export async function saveCustomerContact(
  _prev: FormState<ContactField>,
  formData: FormData,
): Promise<FormState<ContactField>> {
  const session = await requirePermission("customer:write");

  const parsed = CustomerContactSchema.safeParse({
    customerId: formData.get("customerId") ?? "",
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    position: formData.get("position") ?? "",
    isPrimary: formData.get("isPrimary"),
  });
  if (!parsed.success) return fieldErrorState<ContactField>(parsed.error);

  const contactId = formData.get("contactId");
  const existingId = typeof contactId === "string" && contactId !== "" ? IdSchema.parse(contactId) : null;

  const { customerId, ...contact } = parsed.data;
  await assertCustomerInOrganization(customerId, session.organizationId);

  // Demoting the previous primary and saving this one must not leave two
  // primaries behind, so both statements share a transaction (Section 55).
  await withTransaction(async (tx) => {
    if (contact.isPrimary) {
      await tx.customerContact.updateMany({
        where: { customerId, organizationId: session.organizationId, ...(existingId ? { NOT: { id: existingId } } : {}) },
        data: { isPrimary: false },
      });
    }

    if (existingId) {
      const updated = await tx.customerContact.updateMany({
        where: { id: existingId, customerId, organizationId: session.organizationId },
        data: contact,
      });
      if (updated.count === 0) throw new NotFoundError("Contact not found.");
      return;
    }

    await tx.customerContact.create({
      data: { ...contact, customerId, organizationId: session.organizationId },
    });
  });

  revalidatePath(`/customers/${customerId}`);
  return successState<ContactField>();
}

/** Contacts carry no financial history, so removing one is a real delete. */
export async function deleteCustomerContact(formData: FormData): Promise<void> {
  const session = await requirePermission("customer:write");

  const contactId = IdSchema.parse(formData.get("contactId"));
  const customerId = IdSchema.parse(formData.get("customerId"));

  await prisma.customerContact.deleteMany({
    where: { id: contactId, customerId, organizationId: session.organizationId },
  });

  revalidatePath(`/customers/${customerId}`);
}
