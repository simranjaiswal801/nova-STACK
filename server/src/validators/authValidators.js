import { z } from "zod";

const email = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .max(254)
  .transform((value) => value.toLowerCase());
export const registrationSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name.").max(100),
    email,
    password: z
      .string()
      .min(10, "Use at least 10 characters.")
      .max(72, "Password must be 72 characters or fewer.")
      .regex(/[a-z]/, "Add a lowercase letter.")
      .regex(/[A-Z]/, "Add an uppercase letter.")
      .regex(/[0-9]/, "Add a number.")
      .refine(
        (value) => Buffer.byteLength(value, "utf8") <= 72,
        "Password is too long for secure hashing.",
      ),
  })
  .strict();
export const loginSchema = z
  .object({
    email,
    password: z.string().min(1, "Enter your password.").max(72),
  })
  .strict();
export const adminRegistrationSchema = registrationSchema
  .extend({
    setupKey: z.string().min(1, "Enter the admin setup key.").max(256),
  })
  .strict();
