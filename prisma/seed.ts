import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

/**
 * Seeds the bootstrap tenant for Milestone 1: one organization plus one account
 * per application role (Sections 4.1, 5.1).
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

  console.log(`Seeded organization "${organization.name}" (${organization.id})`);
  for (const row of summary) {
    console.log(`  ${row.role.padEnd(11)} ${row._count._all}`);
  }
  console.log(`Sign in as ${OWNER_EMAIL} using SEED_OWNER_PASSWORD from your .env file.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
