import { redirect } from "next/navigation";

import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { hasPermission, type Permission } from "@/lib/permissions";
import { getSession, type SessionClaims } from "@/lib/auth/session";

/**
 * Server-side guards. UI hiding is never an authorization mechanism — every
 * server action and page load resolves the session through these helpers
 * (Section 53, Agent rule 7).
 */

/** For pages: sends unauthenticated visitors to the login screen. */
export async function requireSessionOrRedirect(returnTo?: string): Promise<SessionClaims> {
  const session = await getSession();
  if (session) return session;

  const target = returnTo ? `/login?next=${encodeURIComponent(returnTo)}` : "/login";
  redirect(target);
}

/** For server actions and route handlers: throws instead of redirecting. */
export async function requireSession(): Promise<SessionClaims> {
  const session = await getSession();
  if (!session) throw new AuthenticationError();
  return session;
}

export async function requirePermission(permission: Permission): Promise<SessionClaims> {
  const session = await requireSession();
  if (!hasPermission(session.role, permission)) throw new AuthorizationError();
  return session;
}

/**
 * For pages: a role that cannot see a module is sent back to the dashboard
 * rather than shown an error, since the sidebar already hides the link.
 */
export async function requirePagePermission(permission: Permission): Promise<SessionClaims> {
  const session = await requireSessionOrRedirect();
  if (!hasPermission(session.role, permission)) redirect("/dashboard");
  return session;
}

/**
 * Guards cross-tenant access. Any record loaded by id must be checked against
 * the caller's organization before it is returned or mutated.
 */
export function assertSameOrganization(session: SessionClaims, organizationId: string): void {
  if (session.organizationId !== organizationId) throw new AuthorizationError();
}
