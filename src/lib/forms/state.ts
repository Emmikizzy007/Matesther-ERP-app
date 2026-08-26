import { Prisma } from "@prisma/client";
import { z } from "zod";

/** Shared shape returned by every `useActionState` server action. */
export type FormState<TField extends string = string> = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<TField, string[]>>;
};

export const IDLE_FORM_STATE: FormState = { status: "idle" };

export function successState<TField extends string>(): FormState<TField> {
  return { status: "success" };
}

export function fieldErrorState<TField extends string>(error: z.ZodError): FormState<TField> {
  return {
    status: "error",
    message: "Please correct the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors as Partial<Record<TField, string[]>>,
  };
}

export function errorState<TField extends string>(message: string): FormState<TField> {
  return { status: "error", message };
}

/**
 * Turns Prisma's unique-constraint failure into a message naming the field,
 * so a duplicate customer name or SKU reads as a validation error.
 */
export function uniqueConstraintMessage(error: unknown, fallback: string): string | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return null;

  const target = error.meta?.target;
  const fields = Array.isArray(target) ? target.filter((value): value is string => typeof value === "string") : [];

  if (fields.some((field) => field.includes("name"))) return "Another record already uses this name.";
  if (fields.some((field) => field.includes("sku"))) return "Another product already uses this SKU.";
  return fallback;
}
