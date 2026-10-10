import { z } from "zod";

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(120),
    email: z
      .string()
      .trim()
      .email("Enter a valid email address.")
      .max(254)
      .transform((value) => value.toLowerCase()),
    subject: z.string().trim().min(2, "Add a subject.").max(180),
    message: z
      .string()
      .trim()
      .min(12, "Write at least 12 characters.")
      .max(5000),
    serviceSlug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Choose a valid service.")
      .optional()
      .or(z.literal("")),
    budgetRange: z.string().trim().max(80).optional().default(""),
    preferredTimeline: z.string().trim().max(80).optional().default(""),
  })
  .strict();
