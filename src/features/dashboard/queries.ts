import { UserRole } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireSessionOrRedirect } from "@/lib/auth/guards";
import { NotFoundError } from "@/lib/errors";
import { ROLE_HIERARCHY } from "@/lib/constants/roles";

export type FoundationSnapshot = {
  organizationName: string;
  currency: string;
  timezone: string;
  userCount: number;
  activeUserCount: number;
  roleCounts: { role: UserRole; count: number }[];
};

/**
 * Milestone 1 dashboard data. Every read is filtered by the session's
 * organizationId (Section 53) and the role tally is a single grouped query
 * rather than one query per role (Section 61).
 */
export async function getFoundationSnapshot(): Promise<FoundationSnapshot> {
  const session = await requireSessionOrRedirect();
  const organizationId = session.organizationId;

  const [organization, grouped, activeUserCount] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, currency: true, timezone: true },
    }),
    prisma.user.groupBy({
      by: ["role"],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.user.count({ where: { organizationId, isActive: true } }),
  ]);

  if (!organization) throw new NotFoundError("Organization not found.");

  const counts = new Map(grouped.map((row) => [row.role, row._count._all]));

  return {
    organizationName: organization.name,
    currency: organization.currency,
    timezone: organization.timezone,
    userCount: grouped.reduce((total, row) => total + row._count._all, 0),
    activeUserCount,
    roleCounts: ROLE_HIERARCHY.map((role) => ({ role, count: counts.get(role) ?? 0 })),
  };
}
