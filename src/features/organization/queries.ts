import { requireSessionOrRedirect } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";

/** Base currency for the caller's organization, used to render money fields. */
export async function getOrganizationCurrency(): Promise<string> {
  const session = await requireSessionOrRedirect();

  const organization = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { currency: true },
  });

  if (!organization) throw new NotFoundError("Organization not found.");
  return organization.currency;
}
