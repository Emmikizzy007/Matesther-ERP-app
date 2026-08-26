import { UserRole } from "@prisma/client";

import { ROLE_HIERARCHY } from "@/lib/constants/roles";

/**
 * Permissions are coarse capability names rather than per-route flags so that
 * later milestones can add modules without reshaping the matrix (Section 53).
 */
export const PERMISSIONS = [
  "organization:manage",
  "user:manage",
  "customer:read",
  "customer:write",
  "product:read",
  "product:write",
  "order:read",
  "order:write",
  "production:read",
  "production:assign",
  "production:execute",
  "material:read",
  "material:write",
  "worker:read",
  "worker:write",
  "payment:read",
  "payment:write",
  "expense:read",
  "expense:write",
  "delivery:read",
  "delivery:write",
  "report:read",
  "audit:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const READ_ONLY: readonly Permission[] = [
  "customer:read",
  "product:read",
  "order:read",
  "production:read",
  "material:read",
  "worker:read",
  "payment:read",
  "expense:read",
  "delivery:read",
  "report:read",
];

const OPERATIONAL_WRITE: readonly Permission[] = [
  "customer:write",
  "product:write",
  "order:write",
  "production:assign",
  "production:execute",
  "material:write",
  "worker:write",
  "delivery:write",
];

const FINANCIAL_WRITE: readonly Permission[] = ["payment:write", "expense:write"];

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  OWNER: PERMISSIONS,
  ADMIN: PERMISSIONS,
  MANAGER: [...READ_ONLY, ...OPERATIONAL_WRITE, ...FINANCIAL_WRITE, "audit:read"],
  SUPERVISOR: [...READ_ONLY, "production:assign", "production:execute", "order:write", "worker:write"],
  ACCOUNTANT: [...READ_ONLY, ...FINANCIAL_WRITE],
  STAFF: [...READ_ONLY, "customer:write", "product:write", "order:write", "production:execute", "material:write"],
  VIEWER: READ_ONLY,
};

export function permissionsFor(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/** True when `role` is at least as privileged as `minimum`. */
export function hasAtLeastRole(role: UserRole, minimum: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(role) <= ROLE_HIERARCHY.indexOf(minimum);
}
