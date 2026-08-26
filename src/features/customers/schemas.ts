import { CustomerType } from "@prisma/client";
import { z } from "zod";

import { PaginationParamsSchema } from "@/lib/query/pagination";

/** Empty form fields arrive as "" and are stored as NULL rather than blanks. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .default(null);

export const CustomerSchema = z.object({
  name: z.string().trim().min(2, "Customer name is required.").max(200),
  customerType: z.enum(CustomerType),
  phone: optionalText(30),
  email: z
    .union([z.literal(""), z.string().trim().email("Enter a valid email address.").max(150)])
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .default(null),
  address: optionalText(2000),
  contactPerson: optionalText(150),
  notes: optionalText(2000),
});

export type CustomerInput = z.infer<typeof CustomerSchema>;

export const CustomerContactSchema = z.object({
  customerId: z.string().uuid(),
  name: z.string().trim().min(2, "Contact name is required.").max(150),
  phone: z.string().trim().min(6, "A phone number is required.").max(30),
  email: z
    .union([z.literal(""), z.string().trim().email("Enter a valid email address.").max(150)])
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .default(null),
  position: optionalText(100),
  // Unchecked checkboxes are absent from FormData; checked ones arrive as "on".
  isPrimary: z.preprocess((value) => value === true || value === "on" || value === "true", z.boolean()),
});

export type CustomerContactInput = z.infer<typeof CustomerContactSchema>;

export const CustomerListParamsSchema = PaginationParamsSchema.extend({
  q: z.string().trim().max(200).catch("").default(""),
  type: z.enum(CustomerType).optional().catch(undefined),
  status: z.enum(["active", "inactive", "all"]).catch("active"),
});

export type CustomerListParams = z.infer<typeof CustomerListParamsSchema>;
