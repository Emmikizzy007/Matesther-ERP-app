"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionCookie, destroySessionCookie } from "@/lib/auth/session";
import { LoginSchema } from "@/features/auth/schemas";

export type LoginState = {
  message?: string;
  fieldErrors?: Partial<Record<"email" | "password", string[]>>;
};

/** Only relative in-app paths are accepted, so `next` cannot become an open redirect. */
function safeRedirectTarget(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? undefined,
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { fieldErrors: { email: fieldErrors.email, password: fieldErrors.password } };
  }

  const { email, password, next } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
      isActive: true,
      organizationId: true,
      organization: { select: { isActive: true } },
    },
  });

  // The same message for every failure mode keeps the login form from
  // confirming which email addresses exist.
  const invalid: LoginState = { message: "Incorrect email or password." };

  if (!user) return invalid;
  if (!(await verifyPassword(password, user.passwordHash))) return invalid;
  if (!user.isActive || !user.organization.isActive) {
    return { message: "This account is deactivated. Contact your administrator." };
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await createSessionCookie({
    sub: user.id,
    organizationId: user.organizationId,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect(safeRedirectTarget(next));
}

export async function logout(): Promise<void> {
  await destroySessionCookie();
  redirect("/login");
}
