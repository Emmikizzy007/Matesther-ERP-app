import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Passwords are at least 8 characters."),
  next: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
