import { UserRole } from "@prisma/client";

/**
 * Roles ordered from most to least privileged (Section 5.1). The ordering is
 * the single source of truth for "at least this role" checks.
 */
export const ROLE_HIERARCHY: readonly UserRole[] = [
  UserRole.OWNER,
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.SUPERVISOR,
  UserRole.ACCOUNTANT,
  UserRole.STAFF,
  UserRole.VIEWER,
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  MANAGER: "Manager",
  SUPERVISOR: "Production supervisor",
  ACCOUNTANT: "Accountant",
  STAFF: "Staff",
  VIEWER: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  OWNER: "Full control of the business, including billing and user management.",
  ADMIN: "Manages configuration, users and every operational module.",
  MANAGER: "Runs orders, production and reporting day to day.",
  SUPERVISOR: "Assigns workers and moves batches through production stages.",
  ACCOUNTANT: "Records payments and expenses and reads financial reports.",
  STAFF: "Captures operational data without access to financials.",
  VIEWER: "Read-only access.",
};
