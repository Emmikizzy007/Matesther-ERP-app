import { prisma } from "@/lib/db/prisma";
import { requireSessionOrRedirect } from "@/lib/auth/guards";

/**
 * Loads the signed-in user together with their organization. Scoped by both id
 * and organizationId so a stale cookie can never read across tenants.
 */
export async function getCurrentUser() {
  const session = await requireSessionOrRedirect();

  return prisma.user.findFirst({
    where: { id: session.sub, organizationId: session.organizationId, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      organizationId: true,
      organization: { select: { id: true, name: true, businessName: true, currency: true } },
    },
  });
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
