import { CustomerType, Prisma, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Database tests (Section 67). They write real rows, so they only run when
 * RUN_DB_TESTS=1 points at a throwaway database — CI sets it for its Postgres
 * service. Everything created here is removed afterwards.
 */
const enabled = process.env.RUN_DB_TESTS === "1";

describe.skipIf(!enabled)("customer and product tenant isolation", () => {
  const prisma = new PrismaClient();
  const suffix = Date.now().toString(36);

  let orgA = "";
  let orgB = "";

  beforeAll(async () => {
    const [first, second] = await Promise.all([
      prisma.organization.create({
        data: { name: `Tenant A ${suffix}`, businessName: "A", slug: `tenant-a-${suffix}` },
        select: { id: true },
      }),
      prisma.organization.create({
        data: { name: `Tenant B ${suffix}`, businessName: "B", slug: `tenant-b-${suffix}` },
        select: { id: true },
      }),
    ]);

    orgA = first.id;
    orgB = second.id;
  });

  afterAll(async () => {
    const organizationIds = [orgA, orgB].filter(Boolean);

    await prisma.customerContact.deleteMany({ where: { organizationId: { in: organizationIds } } });
    await prisma.customer.deleteMany({ where: { organizationId: { in: organizationIds } } });
    await prisma.product.deleteMany({ where: { organizationId: { in: organizationIds } } });
    await prisma.productCategory.deleteMany({ where: { organizationId: { in: organizationIds } } });
    await prisma.organization.deleteMany({ where: { id: { in: organizationIds } } });
    await prisma.$disconnect();
  });

  it("allows the same customer name in two organizations but not twice in one", async () => {
    const name = `Shared School ${suffix}`;

    await prisma.customer.create({ data: { organizationId: orgA, name, customerType: CustomerType.SCHOOL } });
    await prisma.customer.create({ data: { organizationId: orgB, name, customerType: CustomerType.SCHOOL } });

    await expect(
      prisma.customer.create({ data: { organizationId: orgA, name, customerType: CustomerType.SCHOOL } }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("hides another organization's customer from a tenant-filtered lookup", async () => {
    const customer = await prisma.customer.create({
      data: { organizationId: orgB, name: `B Only ${suffix}`, customerType: CustomerType.COMPANY },
      select: { id: true },
    });

    expect(
      await prisma.customer.findFirst({ where: { id: customer.id, organizationId: orgA } }),
    ).toBeNull();
    expect(
      await prisma.customer.findFirst({ where: { id: customer.id, organizationId: orgB } }),
    ).not.toBeNull();
  });

  it("cascades contacts when a customer is removed", async () => {
    const customer = await prisma.customer.create({
      data: {
        organizationId: orgA,
        name: `Cascade School ${suffix}`,
        customerType: CustomerType.SCHOOL,
        contacts: {
          create: [{ organizationId: orgA, name: "Bursar", phone: "+2348030000000", isPrimary: true }],
        },
      },
      select: { id: true },
    });

    await prisma.customer.delete({ where: { id: customer.id } });

    expect(await prisma.customerContact.count({ where: { customerId: customer.id } })).toBe(0);
  });

  it("scopes SKU uniqueness to the organization", async () => {
    const sku = `SKU-${suffix}`;

    await prisma.product.create({ data: { organizationId: orgA, name: `P1 ${suffix}`, sku } });
    await prisma.product.create({ data: { organizationId: orgB, name: `P1 ${suffix}`, sku } });

    await expect(
      prisma.product.create({ data: { organizationId: orgA, name: `P2 ${suffix}`, sku } }),
    ).rejects.toMatchObject({ code: "P2002" });
  });

  it("keeps a product but clears its category when the category is deleted", async () => {
    const category = await prisma.productCategory.create({
      data: { organizationId: orgA, name: `Shirts ${suffix}` },
      select: { id: true },
    });

    const product = await prisma.product.create({
      data: {
        organizationId: orgA,
        name: `Categorised ${suffix}`,
        categoryId: category.id,
        sellingPrice: new Prisma.Decimal("4500.55"),
      },
      select: { id: true },
    });

    await prisma.productCategory.delete({ where: { id: category.id } });

    const reloaded = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(reloaded.categoryId).toBeNull();
    // Decimal survives the round trip without float drift.
    expect(reloaded.sellingPrice?.toFixed(2)).toBe("4500.55");
  });
});
