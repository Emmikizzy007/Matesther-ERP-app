import { CustomerType, Prisma, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seeds the bootstrap tenant: one organization, one account per application role
 * (Sections 4.1, 5.1) and a starter customer and product catalogue (Sections
 * 6.1, 7.1, 8.1).
 *
 * The script is idempotent — it upserts on natural keys so it can be re-run
 * against an existing database without duplicating or resetting records.
 */
const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

const ORGANIZATION_NAME = process.env.SEED_ORGANIZATION_NAME ?? "Matesther";
const ORGANIZATION_SLUG = "matesther";

const OWNER_EMAIL = (process.env.SEED_OWNER_EMAIL ?? "owner@matesther.local").toLowerCase();
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD;

type SeedUser = { role: UserRole; name: string; email: string };

const STAFF_ACCOUNTS: SeedUser[] = [
  { role: UserRole.ADMIN, name: "Matesther Administrator", email: "admin@matesther.local" },
  { role: UserRole.MANAGER, name: "Production Manager", email: "manager@matesther.local" },
  { role: UserRole.SUPERVISOR, name: "Floor Supervisor", email: "supervisor@matesther.local" },
  { role: UserRole.ACCOUNTANT, name: "Company Accountant", email: "accountant@matesther.local" },
  { role: UserRole.STAFF, name: "Order Desk Staff", email: "staff@matesther.local" },
  { role: UserRole.VIEWER, name: "Read Only Viewer", email: "viewer@matesther.local" },
];

function requirePassword(): string {
  if (!OWNER_PASSWORD) {
    throw new Error(
      "SEED_OWNER_PASSWORD is not set. Add it to .env before seeding so no default credential is ever committed.",
    );
  }
  if (OWNER_PASSWORD.length < 8) {
    throw new Error("SEED_OWNER_PASSWORD must be at least 8 characters.");
  }
  return OWNER_PASSWORD;
}

const CATEGORIES: { name: string; description: string }[] = [
  { name: "Shirts", description: "Short and long sleeve uniform shirts." },
  { name: "Trousers", description: "Boys and men's uniform trousers." },
  { name: "Skirts & Pinafores", description: "Girls uniform skirts and pinafores." },
  { name: "Sportswear", description: "House wear, jerseys and tracksuits." },
];

const PRODUCTS: {
  name: string;
  sku: string;
  category: string;
  unit: string;
  sellingPrice: string;
  description: string;
}[] = [
  {
    name: "Boys shirt — short sleeve",
    sku: "SHIRT-SS-BOY",
    category: "Shirts",
    unit: "piece",
    sellingPrice: "4500.00",
    description: "White poplin short sleeve shirt with school crest.",
  },
  {
    name: "Boys trousers",
    sku: "TROUSER-BOY",
    category: "Trousers",
    unit: "piece",
    sellingPrice: "6500.00",
    description: "Grey gabardine trousers.",
  },
  {
    name: "Girls pinafore",
    sku: "PINAFORE-GIRL",
    category: "Skirts & Pinafores",
    unit: "piece",
    sellingPrice: "7000.00",
    description: "Checked pinafore with adjustable waist.",
  },
  {
    name: "House wear set",
    sku: "SPORT-HOUSE-SET",
    category: "Sportswear",
    unit: "set",
    sellingPrice: "9000.00",
    description: "Jersey and shorts in house colours.",
  },
];

const CUSTOMERS: {
  name: string;
  customerType: CustomerType;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  contacts: { name: string; phone: string; position: string; isPrimary: boolean }[];
}[] = [
  {
    name: "Bright Future International School",
    customerType: CustomerType.SCHOOL,
    phone: "+2348030000001",
    email: "admin@brightfuture.local",
    address: "12 Awolowo Road, Ikoyi, Lagos",
    contactPerson: "Mrs Adeyemi",
    contacts: [
      { name: "Mrs Adeyemi", phone: "+2348030000001", position: "Bursar", isPrimary: true },
      { name: "Mr Okoro", phone: "+2348030000002", position: "Store keeper", isPrimary: false },
    ],
  },
  {
    name: "Crestwood Academy",
    customerType: CustomerType.SCHOOL,
    phone: "+2348030000003",
    email: "office@crestwood.local",
    address: "5 Ikorodu Road, Yaba, Lagos",
    contactPerson: "Mr Balogun",
    contacts: [{ name: "Mr Balogun", phone: "+2348030000003", position: "Registrar", isPrimary: true }],
  },
  {
    name: "Harmony Logistics Ltd",
    customerType: CustomerType.COMPANY,
    phone: "+2348030000004",
    email: "hr@harmonylogistics.local",
    address: "Plot 9 Oshodi Expressway, Lagos",
    contactPerson: "Ngozi Eze",
    contacts: [{ name: "Ngozi Eze", phone: "+2348030000004", position: "HR lead", isPrimary: true }],
  },
];

/** Starter catalogue and customers so the modules are reviewable after seeding. */
async function seedCatalogue(organizationId: string) {
  const categoryIds = new Map<string, string>();

  for (const category of CATEGORIES) {
    const record = await prisma.productCategory.upsert({
      where: { organizationId_name: { organizationId, name: category.name } },
      update: { description: category.description },
      create: { ...category, organizationId },
      select: { id: true },
    });
    categoryIds.set(category.name, record.id);
  }

  for (const product of PRODUCTS) {
    const { category, sellingPrice, ...rest } = product;
    const data = {
      ...rest,
      sellingPrice: new Prisma.Decimal(sellingPrice),
      categoryId: categoryIds.get(category) ?? null,
    };

    await prisma.product.upsert({
      where: { organizationId_name: { organizationId, name: product.name } },
      update: data,
      create: { ...data, organizationId },
    });
  }

  for (const customer of CUSTOMERS) {
    const { contacts, ...rest } = customer;

    const record = await prisma.customer.upsert({
      where: { organizationId_name: { organizationId, name: customer.name } },
      update: rest,
      create: { ...rest, organizationId },
      select: { id: true },
    });

    for (const contact of contacts) {
      const existing = await prisma.customerContact.findFirst({
        where: { organizationId, customerId: record.id, name: contact.name },
        select: { id: true },
      });

      if (existing) {
        await prisma.customerContact.update({ where: { id: existing.id }, data: contact });
        continue;
      }

      await prisma.customerContact.create({
        data: { ...contact, customerId: record.id, organizationId },
      });
    }
  }

  return {
    categories: await prisma.productCategory.count({ where: { organizationId } }),
    products: await prisma.product.count({ where: { organizationId } }),
    customers: await prisma.customer.count({ where: { organizationId } }),
  };
}

async function main() {
  const password = requirePassword();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const organization = await prisma.organization.upsert({
    where: { slug: ORGANIZATION_SLUG },
    update: { name: ORGANIZATION_NAME, businessName: `${ORGANIZATION_NAME} Uniforms` },
    create: {
      name: ORGANIZATION_NAME,
      businessName: `${ORGANIZATION_NAME} Uniforms`,
      slug: ORGANIZATION_SLUG,
      email: "hello@matesther.local",
      phone: "+2348000000000",
      address: "Lagos, Nigeria",
      currency: "NGN",
      timezone: "Africa/Lagos",
    },
  });

  const accounts: SeedUser[] = [
    { role: UserRole.OWNER, name: "Matesther Owner", email: OWNER_EMAIL },
    ...STAFF_ACCOUNTS,
  ];

  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      // Passwords are only set on creation so re-seeding never resets a
      // credential an administrator has since rotated.
      update: { name: account.name, role: account.role, organizationId: organization.id },
      create: {
        name: account.name,
        email: account.email,
        role: account.role,
        passwordHash,
        organizationId: organization.id,
      },
    });
  }

  const summary = await prisma.user.groupBy({
    by: ["role"],
    where: { organizationId: organization.id },
    _count: { _all: true },
  });

  const catalogue = await seedCatalogue(organization.id);

  console.log(`Seeded organization "${organization.name}" (${organization.id})`);
  for (const row of summary) {
    console.log(`  ${row.role.padEnd(11)} ${row._count._all}`);
  }
  console.log(
    `  customers ${catalogue.customers} · categories ${catalogue.categories} · products ${catalogue.products}`,
  );
  console.log(`Sign in as ${OWNER_EMAIL} using SEED_OWNER_PASSWORD from your .env file.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
