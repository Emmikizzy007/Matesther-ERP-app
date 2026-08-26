import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { z } from "zod";

import { getEnv } from "@/lib/env";
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth/constants";

export { SESSION_COOKIE };

/**
 * Claims carried by the session cookie. `organizationId` travels with the
 * session so that every tenant-scoped query can be filtered without an extra
 * round trip (Sections 53, 54).
 */
const SessionClaimsSchema = z.object({
  sub: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: z.nativeEnum(UserRole),
  name: z.string(),
  email: z.string(),
});

export type SessionClaims = z.infer<typeof SessionClaimsSchema>;

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getEnv().AUTH_SECRET);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT(claims as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

/** Returns the claims when the token is valid and unexpired, otherwise null. */
export async function readSessionToken(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const parsed = SessionClaimsSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function createSessionCookie(claims: SessionClaims): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(claims), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionClaims | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}
