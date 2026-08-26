import { UserRole } from "@prisma/client";
import { describe, expect, it } from "vitest";

import { hasPermission } from "@/lib/permissions";

/**
 * Milestone 2 authorization matrix: who may change customer and catalogue data.
 * Read access is deliberately open to every role.
 */
const CAN_WRITE: UserRole[] = [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF];
const CANNOT_WRITE: UserRole[] = [UserRole.SUPERVISOR, UserRole.ACCOUNTANT, UserRole.VIEWER];

describe("customer and product permissions", () => {
  it.each(Object.values(UserRole))("lets %s read customers and products", (role) => {
    expect(hasPermission(role, "customer:read")).toBe(true);
    expect(hasPermission(role, "product:read")).toBe(true);
  });

  it.each(CAN_WRITE)("lets %s write customers and products", (role) => {
    expect(hasPermission(role, "customer:write")).toBe(true);
    expect(hasPermission(role, "product:write")).toBe(true);
  });

  it.each(CANNOT_WRITE)("stops %s writing customers and products", (role) => {
    expect(hasPermission(role, "customer:write")).toBe(false);
    expect(hasPermission(role, "product:write")).toBe(false);
  });
});
