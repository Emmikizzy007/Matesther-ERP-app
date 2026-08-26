import { CustomerType, Prisma } from "@prisma/client";

import { requirePagePermission } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";
import { resolvePage, skipFor, type PageMeta } from "@/lib/query/pagination";
import type { CustomerListParams } from "@/features/customers/schemas";

export type CustomerListRow = {
  id: string;
  name: string;
  customerType: CustomerType;
  phone: string | null;
  email: string | null;
  contactPerson: string | null;
  isActive: boolean;
  contactCount: number;
};

export type CustomerDetail = {
  id: string;
  name: string;
  customerType: CustomerType;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactPerson: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  contacts: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    position: string | null;
    isPrimary: boolean;
  }[];
};

/**
 * Search, filtering and pagination for the customer list. The tenant filter is
 * applied here rather than trusted from the caller (Section 54).
 */
function whereFor(organizationId: string, params: CustomerListParams): Prisma.CustomerWhereInput {
  const search = params.q;

  return {
    organizationId,
    ...(params.status === "all" ? {} : { isActive: params.status === "active" }),
    ...(params.type ? { customerType: params.type } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { contactPerson: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function listCustomers(
  params: CustomerListParams,
): Promise<{ rows: CustomerListRow[]; meta: PageMeta }> {
  const session = await requirePagePermission("customer:read");
  const where = whereFor(session.organizationId, params);

  const total = await prisma.customer.count({ where });
  const meta = resolvePage(params.page, total, params.pageSize);

  const customers = await prisma.customer.findMany({
    where,
    orderBy: [{ name: "asc" }],
    skip: skipFor(meta.page, meta.pageSize),
    take: meta.pageSize,
    select: {
      id: true,
      name: true,
      customerType: true,
      phone: true,
      email: true,
      contactPerson: true,
      isActive: true,
      _count: { select: { contacts: true } },
    },
  });

  return {
    rows: customers.map(({ _count, ...customer }) => ({ ...customer, contactCount: _count.contacts })),
    meta,
  };
}

export async function getCustomer(customerId: string): Promise<CustomerDetail> {
  const session = await requirePagePermission("customer:read");

  // The organization is part of the lookup, so another tenant's id reads as
  // "not found" instead of leaking existence.
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, organizationId: session.organizationId },
    select: {
      id: true,
      name: true,
      customerType: true,
      phone: true,
      email: true,
      address: true,
      contactPerson: true,
      notes: true,
      isActive: true,
      createdAt: true,
      contacts: {
        orderBy: [{ isPrimary: "desc" }, { name: "asc" }],
        select: { id: true, name: true, phone: true, email: true, position: true, isPrimary: true },
      },
    },
  });

  if (!customer) throw new NotFoundError("Customer not found.");
  return customer;
}
